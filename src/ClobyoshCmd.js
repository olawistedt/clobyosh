//
// Clobyosh auto play
//
const t = require('./Clobyosh.js');

function play() {
  let judgeClobyosh = new t.JudgeClobyosh();
  let gameClobyosh = new t.GameClobyosh(2, 3, judgeClobyosh);
  gameClobyosh.upperHandPlayer.setName('Computer');
  gameClobyosh.lowerHandPlayer.setName('Ola');

  let sumDealAi = 0;
  let sumDealPl = 0;
  let sumAi = 0;
  let sumPl = 0;
  let turn = 0;
  let nrOfDeals = 0;

  let totalPoints;
  while (true) {
    gameClobyosh.newGame();

    do {
      gameClobyosh.newSingleDeal();
      gameClobyosh.dealer.shuffle();
      gameClobyosh.dealer.deal();

      // Play phase 1
      while (!judgeClobyosh.isEndOfFirstPhase()) {
        judgeClobyosh.setLeadCard(judgeClobyosh.leader.getCard());
        judgeClobyosh.setOpponentCard(judgeClobyosh.opponent.getCard());
        let winningPlayer = judgeClobyosh.getWinnerOfTrick();
        winningPlayer.addTrick([
          judgeClobyosh.getLeadCard(), judgeClobyosh.getOpponentCard()
        ]);

        judgeClobyosh.leader.addCard(gameClobyosh.dealer.getTopCard());
        judgeClobyosh.opponent.addCard(gameClobyosh.dealer.getTopCard());

        let marriages =
            judgeClobyosh.getMarriageCandidates(judgeClobyosh.leader.getHand());
        if (marriages.length > 0) {
          let m = judgeClobyosh.leader.getMarriage(marriages);
          judgeClobyosh.setMarriage(m);
        }
      }

      // Play phase 2
      while (!judgeClobyosh.isEndOfSecondPhase()) {
        judgeClobyosh.setLeadCard(judgeClobyosh.leader.getCard());
        judgeClobyosh.setOpponentCard(judgeClobyosh.opponent.getCard());
        let winningPlayer = judgeClobyosh.getWinnerOfTrick();
        winningPlayer.addTrick([
          judgeClobyosh.getLeadCard(), judgeClobyosh.getOpponentCard()
        ]);
      }

      gameClobyosh.dealer.nextDealer();
      totalPoints = gameClobyosh.judge.setTotalPoints();

      nrOfDeals++;
      if (gameClobyosh.upperHandPlayer.deal_points >
          gameClobyosh.lowerHandPlayer.deal_points) {
        sumDealAi++;
      } else {
        sumDealPl++;
      }

    } while (totalPoints < 1001)

    turn += 1;

    if (gameClobyosh.upperHandPlayer.total_points >
        gameClobyosh.lowerHandPlayer.total_points) {
      sumAi++;
    } else {
      sumPl++;
    }

    if (turn % 1000 == 0) {
      console.log(
          'Deals: ' + gameClobyosh.upperHandPlayer.getName() + ' ' +
          sumDealAi + ' : ' + gameClobyosh.lowerHandPlayer.getName() + ' ' +
          sumDealPl + ' : Totals: ' +
          gameClobyosh.upperHandPlayer.getName() + ' ' + sumAi + ' : ' +
          gameClobyosh.lowerHandPlayer.getName() + ' ' + sumPl);
    }

    if (turn % 10000 == 0) {
      console.log('Ratio deals: ' + sumDealPl / nrOfDeals);
      console.log('Ratio totals: ' + sumPl / turn);
      return;
    }
  }
}

play();
