from flask import Blueprint, jsonify
from models.models import Assignment
from models import db
from sqlalchemy import text

assignments_bp = Blueprint("assignments", __name__)

@assignments_bp.route("/", methods=["GET"])
def get_assignments_history():
    try:
        assignments = Assignment.query.order_by(Assignment.time.desc()).all()

        # Récupérer les executed_at pour les run_id présents (si la table existe)
        run_ids = sorted({a.run_id for a in assignments if getattr(a, 'run_id', None) is not None})
        run_info = {}
        if run_ids:
            # Certains adaptateurs DB ne gèrent pas bien un paramètre liste avec ANY(:ids).
            # Pour être robuste, on récupère les executed_at par run_id individuellement.
            for rid in run_ids:
                try:
                    row = db.session.execute(text("SELECT executed_at FROM optimisation_runs WHERE id = :id"), {"id": rid}).fetchone()
                    if row:
                        run_info[rid] = row.executed_at
                except Exception as e:
                    # Table optimisation_runs peut ne pas exister ou autre erreur : on log et on continue
                    print(f"optimisation_runs lookup for id={rid} failed:", e)
                    # On n'abandonne pas tout, on laisse run_info partiel
                    continue

        # Grouper les assignments par run (run_id) ou par time si run_id absent
        groups = {}
        for a in assignments:
            # Utiliser getattr pour éviter AttributeError si run_id absent
            rid = getattr(a, 'run_id', None)
            # Protéger l'accès à time
            try:
                time_val = a.time
            except Exception:
                time_val = None
            if rid is not None:
                key = rid
            else:
                key = f"norun::{time_val.isoformat() if time_val else 'unknown'}"

            if key not in groups:
                groups[key] = {
                    "run_id": rid,
                    "executed_at": run_info.get(rid) if rid is not None else time_val,
                    "assignments": [],
                    "camions": set(),
                    "num_colis": 0,
                    "total_weight": 0.0
                }

            groups[key]["assignments"].append(a.to_dict())

            # protection si la relation camion/colis est manquante
            try:
                camion_id = getattr(a.camion, 'id_camion', None) or getattr(a, 'id_camion', None)
                if camion_id is not None:
                    groups[key]["camions"].add(str(camion_id))
            except Exception:
                pass

            groups[key]["num_colis"] += 1
            try:
                colis_weight = getattr(a.colis, 'poids', 0) or 0
            except Exception:
                colis_weight = 0
            groups[key]["total_weight"] += colis_weight

        # Convertir en liste triée par date décroissante
        runs = []
        for k, g in groups.items():
            runs.append({
                "run_id": g["run_id"],
                "executed_at": g["executed_at"].isoformat() if g["executed_at"] else None,
                "assignments": g["assignments"],
                "camions": list(g["camions"]),
                "num_colis": g["num_colis"],
                "total_weight": round(g["total_weight"], 2)
            })

        runs.sort(key=lambda r: r["executed_at"] or "", reverse=True)
        return jsonify(runs), 200

    except Exception as e:
        print("Error fetching grouped assignments:", e)
        return jsonify({"error": "Internal server error"}), 500