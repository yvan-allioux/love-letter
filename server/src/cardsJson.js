// Import du fichier JSON
const cards = require('./data/cartes.json');

// Fonction pour trouver une carte basée sur la puissance
function findCardByPower(power) {
    return cards.cards.find(c => c.power === Number(power));
}

module.exports = {
    findAll: () => cards,
    findByPower: findCardByPower,
    findDescriptionByPower: (power) => {
        const card = findCardByPower(power);
        return card ? card.description : null;
    },
    findNameByPower: (power) => {
        const card = findCardByPower(power);
        return card ? card.name : null;
    },
    findNumberByPower: (power) => {
        const card = findCardByPower(power);
        return card ? card.number : null;
    }
};
