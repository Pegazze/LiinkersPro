import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import pour la navigation
import * as XLSX from "xlsx";
import "./Simulateur.css";
import Tree from "react-d3-tree"; // Pour affichage graphique de l'arbre

function Simulateur() {
  const [sponsors, setSponsors] = useState([]);
  const [nomComplet, setNomComplet] = useState("");
  const [vaPersonnelle, setVaPersonnelle] = useState(0);
  const [tableauImporte, setTableauImporte] = useState([]);
  const [resultat, setResultat] = useState({ commission: 0, qualification: "" });
  const [arbreGraphique, setArbreGraphique] = useState(null);

  const navigate = useNavigate(); // Hook pour naviguer

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setTableauImporte(jsonData);

      const sponsorsUniques = [...new Set(jsonData.map((row) => row["Sponsor"]?.trim()))];
      setSponsors(sponsorsUniques.filter((sponsor) => sponsor));
    };
    reader.readAsArrayBuffer(file);
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
      const nom = row["Utilisateur"]?.trim();
      const sponsor = row["Sponsor"]?.trim();
      const vaPerso = parseFloat(row["VA personnelles "]) || 0;

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
    if (!nomComplet || tableauImporte.length === 0) {
      alert("Veuillez sélectionner votre nom et importer un fichier !");
      return;
    }

    const arbreUtilisateur = construireArbre(tableauImporte, nomComplet);
    if (!arbreUtilisateur) {
      alert("Aucun arbre trouvé pour cet utilisateur.");
      return;
    }

    const vaPerso = parseFloat(vaPersonnelle) || 0;

    const arbrePourGraphique = {
      name: `${nomComplet} (VA : ${vaPerso}€)`,
      children: arbreUtilisateur.enfants.map((enfant) =>
        convertirArbrePourGraphique(arbreUtilisateur.arbre, enfant, vaPerso)
      ),
    };

    setArbreGraphique(arbrePourGraphique);

    const vaGlobale = tableauImporte.reduce((sum, row) => {
      const va = parseFloat(row["VA personnelles "]) || 0;
      return sum + va;
    }, 0);

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

    let commissionTotale = vaPerso * (vaPerso < 250 ? 0 : vaPerso < 500 ? 0.2 : vaPerso >= 500 ? 0.25 : 0 );

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

    criteresParNiveau.forEach(({ niveau, pourcentage, vaGlobaleMin, vaBrancheMin, qualificationMin }) => {
      if (
        vaGlobale >= vaGlobaleMin &&
        top2Branches[1] >= vaBrancheMin &&
        (!qualificationMin || qualification === qualificationMin)
      ) {
        const calculerVaPourNiveauExact = (noeuds, niveauActuel, niveauCible) => {
          if (niveauActuel > niveauCible) return 0;
          if (niveauActuel === niveauCible) {
            return noeuds.reduce((sum, enfant) => {
              const vaEnfant = arbreUtilisateur.arbre[enfant]?.vaPerso || 0;
              return sum + vaEnfant;
            }, 0);
          }
          return noeuds.reduce((sum, enfant) => {
            const enfantsSuivants = arbreUtilisateur.arbre[enfant]?.enfants || [];
            return sum + calculerVaPourNiveauExact(enfantsSuivants, niveauActuel + 1, niveauCible);
          }, 0);
        };
    
        const niveauCible = parseInt(niveau.replace("R", ""), 10);
        const totalVaNiveauExact = calculerVaPourNiveauExact(arbreUtilisateur.enfants, 1, niveauCible);
    
        const taux = vaPerso < 250 ? 0 : vaPerso < 500 ? pourcentage[0] : vaPerso < 1000 ? pourcentage[1] : pourcentage[2];
        const commissionNiveau = totalVaNiveauExact * taux;
    
        commissionTotale += commissionNiveau;
    
        console.log(`Commission pour ${niveau} : ${commissionNiveau.toFixed(2)} €`);
        console.log(`Total VA pour ${niveau} : ${totalVaNiveauExact}`);
      }
    });
    
    console.log("Commission totale calculée :", commissionTotale.toFixed(2));
    console.log("Qualification atteinte :", qualification);

    // Mise à jour des résultats finaux
    setResultat({ commission: commissionTotale, qualification });
  };

  return (
    <div className="Simulateur">
      <h1>Simulateur de Commissions</h1>
      <div className="upload-container">
        <label htmlFor="file-upload">Importer vos données :</label>
        <input
          type="file"
          id="file-upload"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
        />
      </div>
      <div className="name-container">
        <label htmlFor="nom-complet">Sélectionnez votre profil :</label>
        <select
          id="nom-complet"
          value={nomComplet}
          onChange={(e) => setNomComplet(e.target.value)}
        >
          <option value="">-- Sélectionnez un sponsor --</option>
          {sponsors.map((sponsor, index) => (
            <option key={index} value={sponsor}>
              {sponsor}
            </option>
          ))}
        </select>
      </div>
      <div className="va-container">
        <label htmlFor="va-personnelle">VA Personnelle (€)</label>
        <input
          type="number"
          id="va-personnelle"
          value={vaPersonnelle}
          onChange={(e) => setVaPersonnelle(e.target.value)}
          placeholder="Entrez votre VA personnelle"
        />
      </div>
      <button onClick={calculerCommissions} className="calculate-button">
        Calculer
      </button>
      <button onClick={() => navigate("/simulateur-interactif")} className="navigate-button">
        Accéder au Simulateur Interactif
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
