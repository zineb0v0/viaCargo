import React, { useState, useEffect } from 'react';
import './PackageForm.css'; 

const initialFormData = {
    marque: '', // Devrait être "marque" (backend) et non "brand"
    capacite: 0, // Devrait être "capacite" (backend) et non "capacity"
    status: 'disponible'
};

const TruckForm = ({ isOpen, onClose, onSubmit, truckToEdit }) => {
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (truckToEdit) {
            // Adaptez les données pour correspondre au backend
            setFormData({
                marque: truckToEdit.marque || truckToEdit.brand || '',
                capacite: truckToEdit.capacite || truckToEdit.capacity || 0,
                status: truckToEdit.status || 'disponible'
            });
        } else {
            setFormData(initialFormData);
        }
    }, [truckToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'capacite' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const title = truckToEdit ? "Modifier un camion" : "Ajouter un camion";
    const submitButtonText = truckToEdit ? "Sauvegarder les modifications" : "Ajouter le camion";

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{title}</h3>
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-group">
                        <label htmlFor="marque">Marque et modèle</label>
                        <input type="text" id="marque" name="marque" value={formData.marque} onChange={handleChange} required />
                    </div>

                    <div className="form-group-inline">
                        <div className="form-group">
                            <label htmlFor="capacite">Capacité (kg)</label>
                            <input type="number" id="capacite" name="capacite" value={formData.capacite} onChange={handleChange} required min="1" />
                        </div>

                        <div className="form-group">
                             <label htmlFor="status">État actuel</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange}>
                                <option value="disponible">Disponible</option>
                                <option value="en_livraison">En livraison</option>
                                <option value="hors_service">Hors service</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
                        <button type="submit" className="btn-primary">{submitButtonText}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TruckForm;