import React, { useState, useEffect } from 'react';
import './PackageForm.css'; 

const initialFormData = {
    nom_client: '', // ✅ Changé de 'client' à 'nom_client'
    address: '',
    weight: 0,
    deadline: '',
    status: 'en_stock'
};

const PackageForm = ({ isOpen, onClose, onSubmit, packageToEdit }) => {
    const [formData, setFormData] = useState(initialFormData);
    
    useEffect(() => {
        if (packageToEdit) {
            console.log("Package à éditer:", packageToEdit);
            
            setFormData({
                nom_client: packageToEdit.nom_client || '', // ✅ Cohérent maintenant
                address: packageToEdit.address || '',
                weight: packageToEdit.weight || 0,
                deadline: packageToEdit.deadline ? packageToEdit.deadline.split('T')[0] : '',
                status: packageToEdit.status || 'en_stock'
            });
        } else {
            setFormData(initialFormData);
        }
    }, [packageToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'weight' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const title = packageToEdit ? "Modifier un colis" : "Ajouter un colis";
    const submitButtonText = packageToEdit ? "Sauvegarder les modifications" : "Ajouter le colis";

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{title}</h3>
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-group">
                        <label htmlFor="nom_client">Nom du client</label>
                        <input 
                            type="text" 
                            id="nom_client" 
                            name="nom_client" 
                            value={formData.nom_client} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Adresse de livraison</label>
                        <input 
                            type="text" 
                            id="address" 
                            name="address" 
                            value={formData.address} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group-inline">
                        <div className="form-group">
                            <label htmlFor="weight">Poids (kg)</label>
                            <input 
                                type="number" 
                                id="weight" 
                                name="weight" 
                                value={formData.weight} 
                                onChange={handleChange} 
                                required 
                                min="0.1" 
                                step="0.1"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="deadline">Date limite</label>
                            <input 
                                type="date" 
                                id="deadline" 
                                name="deadline" 
                                value={formData.deadline} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Annuler
                        </button>
                        <button type="submit" className="btn-primary">
                            {submitButtonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PackageForm;