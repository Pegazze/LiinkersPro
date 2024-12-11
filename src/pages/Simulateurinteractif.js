import React, { useState } from "react";
import "./Simulateur.css";
import Tree from "react-d3-tree"; // Pour affichage graphique de l'arbre

function Simulateur() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [resultat, setResultat] = useState({ commission: 0, qualification: "" });
  const [arbreGraphique, setArbreGraphique] = useState(null);
  const [r0, setR0] = useState({ nom: "", vaPersonnelle: 0 });

  const ajouterUtilisateur = (nomComplet, vaPersonnelle, sponsor) => {
    if (!nomComplet || !vaPersonnelle || !sponsor) {
      alert("Veuillez remplir le nom complet, la VA personnelle et le sponsor avant d'ajouter un utilisateur.");
      return;
    }

    setUtilisateurs((prev) => [
      ...prev,
      {
        utilisateur: nomComplet.trim(),
        vaPersonnelle: parseFloat(vaPersonnelle),
        sponsor: sponsor.trim(),
      },
    ]);
  };

  const construireArbre = (data, root) => {
    const arbre = {};
    const ajouterNoeud = (nom, sponsor, vaPerso) => {
      if (!arbre[sponsor]) arbre[sponsor] = { enfants: [], vaPerso: 0 };
      if (!arbre[nom]) arbre[nom] = { enfants: [], vaPerso: 0 };

      arbre[sponsor].enfants.push(nom);
      arbre[nom].vaPerso = vaPerso;
    };

    data.forEach((row) => {
      const { utilisateur: nom, sponsor, vaPersonnelle: vaPerso } = row;
      if (nom && sponsor) {
        ajouterNoeud(nom, sponsor, vaPerso);
      }
    });

    return arbre[root] ? { ...arbre[root], arbre } : null;
  };

  const convertirArbrePourGraphique = (arbre, noeud, vaPersoRacine) => {
    if (!arbre[noeud]) return null;

    return {
      name: `${noeud} (VA : ${arbre[noeud].vaPerso || vaPersoRacine}€)`,
      children: arbre[noeud].enfants.map((enfant) =>
        convertirArbrePourGraphique(arbre, enfant, 0)
      ),
    };
  };

  const calculerCommissions = () => {
    if (!r0.nom || r0.vaPersonnelle <= 0) {
      alert("Veuillez définir le R0 avant de calculer les commissions.");
      return;
    }

    if (utilisateurs.length === 0) {
      alert("Veuillez ajouter des affiliés avant de calculer les commissions.");
      return;
    }

    const arbreUtilisateur = construireArbre(
      [{ utilisateur: r0.nom, sponsor: "", vaPersonnelle: r0.vaPersonnelle }, ...utilisateurs],
      r0.nom
    );

    if (!arbreUtilisateur) {
      alert("Aucun arbre trouvé pour cet utilisateur.");
      return;
    }

    const vaPerso = r0.vaPersonnelle;

    const arbrePourGraphique = {
      name: `${r0.nom} (VA : ${vaPerso}€)`,
      children: arbreUtilisateur.enfants.map((enfant) =>
        convertirArbrePourGraphique(arbreUtilisateur.arbre, enfant, vaPerso)
      ),
    };

    setArbreGraphique(arbrePourGraphique);

    const vaGlobale = [{ utilisateur: r0.nom, vaPersonnelle: r0.vaPersonnelle }, ...utilisateurs].reduce(
      (sum, row) => sum + (row.vaPersonnelle || 0),
      0
    );

    const branches = arbreUtilisateur.enfants.map((enfant) => {
      const calculerVaBranche = (noeud) => {
        if (!arbreUtilisateur.arbre[noeud]) return 0;
        const vaPerso = arbreUtilisateur.arbre[noeud].vaPerso || 0;
        return (
          vaPerso +
          arbreUtilisateur.arbre[noeud].enfants.reduce(
            (sum, enfant) => sum + calculerVaBranche(enfant),
            0
          )
        );
      };
      return calculerVaBranche(enfant);
    });

    const branchesOrdonnees = branches.sort((a, b) => b - a);
    const top2Branches = branchesOrdonnees.slice(0, 2);

    let qualification = "Aucune";
    if (vaPerso >= 250) qualification = "Actif";
    if (vaGlobale >= 1000 && top2Branches[1] >= 200 && vaPerso >= 250)
      qualification = "LiiNKER 1000";
    if (vaGlobale >= 2500 && top2Branches[1] >= 1000 && vaPerso >= 250)
      qualification = "LiiNKER 2500";
    if (vaGlobale >= 5000 && top2Branches[1] >= 2000 && vaPerso >= 250)
      qualification = "LiiNKER 5000";
    if (vaGlobale >= 10000 && top2Branches[1] >= 4000 && vaPerso >= 250)
      qualification = "LiiNKER 10k";
    if (vaGlobale >= 25000 && top2Branches[1] >= 10000 && vaPerso >= 250)
      qualification = "LiiNKER 25k";
    if (vaGlobale >= 50000 && top2Branches[1] >= 20000 && vaPerso >= 250)
      qualification = "LiiNKER 50k";
    if (vaGlobale >= 100000 && top2Branches[1] >= 40000 && vaPerso >= 250)
      qualification = "LiiNKER 100k";
    if (vaGlobale >= 200000 && top2Branches[1] >= 75000 && vaPerso >= 250)
      qualification = "LiiNKER 200k";
    if (vaGlobale >= 300000 && top2Branches[1] >= 100000 && vaPerso >= 250)
      qualification = "LiiNKER 300k";
    if (vaGlobale >= 500000 && top2Branches[1] >= 200000 && vaPerso >= 250)
      qualification = "LiiNKER 500k";

    const criteresParNiveau = [
      { niveau: "R1", pourcentage: [0.05, 0.09, 0.1], vaGlobaleMin: 1000, vaBrancheMin: 200 },
      { niveau: "R2", pourcentage: [0.02, 0.02, 0.03], vaGlobaleMin: 1000, vaBrancheMin: 200, qualificationMin: "LiiNKER 1000" },
      { niveau: "R2", pourcentage: [0.04, 0.04, 0.05], vaGlobaleMin: 2500, vaBrancheMin: 1000, qualificationMin: "LiiNKER 2500" },
      { niveau: "R3", pourcentage: [0.03, 0.03, 0.05], vaGlobaleMin: 5000, vaBrancheMin: 2000 },
      { niveau: "R4", pourcentage: [0.02, 0.02, 0.03], vaGlobaleMin: 10000, vaBrancheMin: 4000 },
      { niveau: "R5", pourcentage: [0.02, 0.02, 0.03], vaGlobaleMin: 25000, vaBrancheMin: 10000 },
      { niveau: "R6", pourcentage: [0.01, 0.01, 0.01], vaGlobaleMin: 50000, vaBrancheMin: 20000 },
      { niveau: "R7", pourcentage: [0.01, 0.01, 0.01], vaGlobaleMin: 50000, vaBrancheMin: 20000 },
      { niveau: "R8", pourcentage: [0.01, 0.01, 0.01], vaGlobaleMin: 50000, vaBrancheMin: 20000 },
      { niveau: "R9", pourcentage: [0.01, 0.01, 0.01], vaGlobaleMin: 50000, vaBrancheMin: 20000 },
      { niveau: "R10", pourcentage: [0.01, 0.01, 0.01], vaGlobaleMin: 50000, vaBrancheMin: 20000 },
    ];

    let commissionTotale = vaPerso;

    criteresParNiveau.forEach(({ niveau, pourcentage, vaGlobaleMin, vaBrancheMin, qualificationMin }) => {
      if (
        vaGlobale >= vaGlobaleMin &&
        top2Branches[1] >= vaBrancheMin &&
        (!qualificationMin || qualification === qualificationMin)
      ) {
        const taux = pourcentage[top2Branches[1] < 1000 ? 0 : top2Branches[1] < 2000 ? 1 : 2];
        commissionTotale += vaGlobale * taux;
      }
    });

    setResultat({ commission: commissionTotale, qualification });
  };

  return (
    <div className="Simulateur">
      <h1>Simulateur de Commissions</h1>
      <div className="input-container">
        <h2>Définir le R0</h2>
        <input
          type="text"
          placeholder="Nom complet R0"
          value={r0.nom}
          onChange={(e) => setR0((prev) => ({ ...prev, nom: e.target.value }))}
        />
        <input
          type="number"
          placeholder="VA Personnelle R0 (€)"
          value={r0.vaPersonnelle}
          onChange={(e) => setR0((prev) => ({ ...prev, vaPersonnelle: parseFloat(e.target.value) || 0 }))}
        />
      </div>

      <div className="input-container">
        <h2>Ajouter un affilié</h2>
        <input id="nomComplet" type="text" placeholder="Nom complet" />
        <input id="vaPersonnelle" type="number" placeholder="VA Personnelle (€)" />
        <input id="sponsor" type="text" placeholder="Sponsor" />
        <button
          onClick={() =>
            ajouterUtilisateur(
              document.getElementById("nomComplet").value,
              document.getElementById("vaPersonnelle").value,
              document.getElementById("sponsor").value
            )
          }
        >
          Ajouter
        </button>
      </div>

      <div className="users-list">
        <h2>Affiliés ajoutés</h2>
        {utilisateurs.map((user, index) => (
          <div key={index}>
            <p>
              {user.utilisateur} (VA : {user.vaPersonnelle}€, Sponsor : {user.sponsor})
            </p>
          </div>
        ))}
      </div>

      <button onClick={calculerCommissions} className="calculate-button">
        Calculer
      </button>
      <div className="results">
        <h2>Résultats</h2>
        <p>Commission totale : {resultat.commission.toFixed(2)} €</p>
        <p>Qualification : {resultat.qualification}</p>
        {arbreGraphique && (
          <div className="tree-container">
            <h3>Arbre généalogique</h3>
            <div style={{ width: "100%", height: "500px" }}>
              <Tree data={arbreGraphique} orientation="vertical" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Simulateur;
