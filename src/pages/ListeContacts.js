import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./ListeContacts.css";

function ListeContacts() {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    description: "",
    statut: "Identifier",
    prochainRdv: "",
    note: "",
  });

  const statutsDisponibles = ["Connecter", "Offrir", "Présenter", "Identifier", "Suivre"];

  // Ajouter un nouveau contact
  const ajouterContact = () => {
    setContacts([...contacts, newContact]);
    setNewContact({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      description: "",
      statut: "Identifier",
      prochainRdv: "",
      note: "",
    });
  };

  // Supprimer un contact
  const supprimerContact = (index) => {
    const nouvelleListe = [...contacts];
    nouvelleListe.splice(index, 1);
    setContacts(nouvelleListe);
  };

  // Exporter les contacts en fichier Excel
  const exporterContacts = () => {
    const feuille = XLSX.utils.json_to_sheet(contacts);
    const classeur = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, feuille, "Contacts");
    XLSX.writeFile(classeur, "contacts.xlsx");
  };

  // Importer les contacts depuis un fichier Excel
  const importerContacts = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setContacts([...contacts, ...jsonData]);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="ListeContacts">
      <h1>Répertoire des Contacts</h1>

      <div className="form-ajout">
        <h2>Ajouter un Contact</h2>
        <input
          type="text"
          placeholder="Nom"
          value={newContact.nom}
          onChange={(e) => setNewContact({ ...newContact, nom: e.target.value })}
        />
        <input
          type="text"
          placeholder="Prénom"
          value={newContact.prenom}
          onChange={(e) => setNewContact({ ...newContact, prenom: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newContact.email}
          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Téléphone"
          value={newContact.telephone}
          onChange={(e) => setNewContact({ ...newContact, telephone: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={newContact.description}
          onChange={(e) => setNewContact({ ...newContact, description: e.target.value })}
        />
        <select
          value={newContact.statut}
          onChange={(e) => setNewContact({ ...newContact, statut: e.target.value })}
        >
          {statutsDisponibles.map((statut, index) => (
            <option key={index} value={statut}>
              {statut}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={newContact.prochainRdv}
          onChange={(e) => setNewContact({ ...newContact, prochainRdv: e.target.value })}
        />
        <textarea
          placeholder="Note"
          value={newContact.note}
          onChange={(e) => setNewContact({ ...newContact, note: e.target.value })}
        />
        <button onClick={ajouterContact}>Ajouter</button>
      </div>

      <div className="liste-contacts">
        <h2>Liste des Contacts</h2>
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Description</th>
              <th>Statut</th>
              <th>Prochain RDV</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => (
              <tr key={index}>
                <td>{contact.nom}</td>
                <td>{contact.prenom}</td>
                <td>{contact.email}</td>
                <td>{contact.telephone}</td>
                <td>{contact.description}</td>
                <td>
                  <select
                    value={contact.statut}
                    onChange={(e) => {
                      const nouvelleListe = [...contacts];
                      nouvelleListe[index].statut = e.target.value;
                      setContacts(nouvelleListe);
                    }}
                  >
                    {statutsDisponibles.map((statut, statutIndex) => (
                      <option key={statutIndex} value={statut}>
                        {statut}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{contact.prochainRdv}</td>
                <td>{contact.note}</td>
                <td>
                  <button onClick={() => supprimerContact(index)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="actions">
        <button onClick={exporterContacts}>Exporter au format Excel</button>
        <input type="file" accept=".xlsx, .xls" onChange={importerContacts} />
      </div>
    </div>
  );
}

export default ListeContacts;
