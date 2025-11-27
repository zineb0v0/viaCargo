from datetime import datetime
from database import get_connection

meilleure_solution = {"valeur": 0, "repartition": {}}


def branch_and_bound(colis_restants, camions_dict, valeur_courante, repartition_courante):
    global meilleure_solution

    if not colis_restants:
        if valeur_courante > meilleure_solution["valeur"]:
            meilleure_solution["valeur"] = valeur_courante
            meilleure_solution["repartition"] = {
                k: v.copy() for k, v in repartition_courante.items()
            }
        return

    c = colis_restants[0]
    reste = colis_restants[1:]

    for cid, camion in camions_dict.items():

        if c["poids"] <= camion["capacite_restante"]:

           
            camion["capacite_restante"] -= c["poids"]
            repartition_courante[cid].append(c["id_colis"])

            nouvelle_valeur = valeur_courante + c["priorite"]

            borne = nouvelle_valeur + sum(x["priorite"] for x in reste)

            if borne > meilleure_solution["valeur"]:
                branch_and_bound(reste, camions_dict, nouvelle_valeur, repartition_courante)

        
            repartition_courante[cid].pop()
            camion["capacite_restante"] += c["poids"]

    branch_and_bound(reste, camions_dict, valeur_courante, repartition_courante)


def executer_bnb():
    global meilleure_solution

    conn = get_connection()
    cur = conn.cursor()

    
    cur.execute("SELECT id_camion, capacite FROM camion")
    camions = cur.fetchall()

    cur.execute("SELECT id_colis, poids, date_livraison FROM colis")
    colis = cur.fetchall()

    now = datetime.now()
    for c in colis:
        temps = (c["date_livraison"] - now).total_seconds()
        c["priorite"] = 1 / temps if temps > 0 else 1000


    camions_dict = {c["id_camion"]: {"capacite_restante": c["capacite"]} for c in camions}
    repartition_init = {c["id_camion"]: [] for c in camions}

    meilleure_solution = {"valeur": 0, "repartition": {}}

    branch_and_bound(colis, camions_dict, 0, repartition_init)

    date_exec = datetime.now()
    for camion_id, colis_list in meilleure_solution["repartition"].items():
        for id_colis in colis_list:
            cur.execute("""
                INSERT INTO assignments(id_camion, id_colis, time)
                VALUES (%s, %s, %s)
            """, (camion_id, id_colis, date_exec))

    conn.commit()
    conn.close()

    return {
        "date_execution": str(date_exec),
        "repartition": meilleure_solution["repartition"]
    }
