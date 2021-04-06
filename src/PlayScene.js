
alert /** @type {import("../typings")} */

'use strict';

// Use shift-F5 to reload program
const TEST = false;
const SPEED = 400;  // 350;  // Good for playing live is 400
const UPPER_HAND_IS_DEALER = -1;
const LOWER_HAND_IS_DEALER = 1;
const FRONT_FRAME = 0;
const BACK_FRAME = 1;
const HAND_DIST_FROM_HORISONTAL_BORDERS = 100;
const HAND_DIST_FROM_VERTICAL_BORDERS = 250;
const HAND_DIST_BETWEEN_CARDS = 80;
const TRICKS_FROM_HORISONTAL_BORDER = 100;
const TRICKS_FROM_VERTICAL_BORDER = 100;

class PlayScene extends Phaser.Scene {
  constructor() {
    super({key: 'PLAY'});

    this.spritesHash = {};  // All sprites with 3 characters as keys
    this.anims_hash = {};  // All sprites has an animation with front and back.
    this.first_time = true;
    this.judgeClobyosh = new JudgeClobyosh();
    if (TEST) {
      this.gameClobyosh = new GameClobyosh(2, 3, this.judgeClobyosh);
    } else {
      this.gameClobyosh = new GameClobyosh(2, 0, this.judgeClobyosh);
    }
  }

  init(data) {
    if (data.caller == 'menu') {
      this.gameClobyosh.setAiLevel(data.level);
    }
  }

  preload() {
    preloadCards(this);

    // Images
    this.load.image('cloth', 'assets/tilesets/bgslagrn.jpg');
    this.load.image('button_ok', 'assets/buttons/button_ok.png');

    this.load.image('button_clubs', 'assets/buttons/button_clubs.png');
    this.load.image('button_diamonds', 'assets/buttons/button_diamonds.png');
    this.load.image('button_hearts', 'assets/buttons/button_hearts.png');
    this.load.image('button_spades', 'assets/buttons/button_spades.png');
    this.load.image('button_none', 'assets/buttons/button_none.png');

    // Audios
    this.load.audio('wrong_card', ['assets/sound/wrong_card.mp3']);
    //    this.load.audio('play_card', ['assets/sound/PlayCard.mp3']);
    //    this.load.audio('deal_card', ['assets/sound/DealCard.mp3']);
    //    this.load.audio('shuffle', ['assets/sound/Shuffle.mp3']);
  }

  create() {
    this.add.tileSprite(
        0, 0, this.game.renderer.width * 2, this.game.renderer.height * 2,
        'cloth');  // Add the background

    this.snd_wrong_card = this.sound.add('wrong_card');
    //    this.snd_deal_card = this.sound.add('deal_card');
    //    this.snd_shuffle = this.sound.add('shuffle');
    //    this.snd_play_card = this.sound.add('play_card');
    //    this.snd_play_upper_card = this.sound.add('play_card');

    this.showTrumpText =
        this.add
            .text(
                this.game.renderer.width - 40, 23, 'Trump',
                {fontFamily: '"Arial"', fontSize: '12px', depth: 100})
            .setOrigin(0.5);


    // Talk to the game engine begins
    this.gameClobyosh.upperHandPlayer.setName('Upper hand');
    this.gameClobyosh.lowerHandPlayer.setName('Lower hand');

    if (this.first_time) {
      this.gameClobyosh.newGame();
      this.first_time = false;
    }
    this.gameClobyosh.newSingleDeal();
    this.gameClobyosh.dealer.shuffle();
    //    this.gameClobyosh.dealer.shuffleTestMarriage();
    let deck_pos;
    if (this.gameClobyosh.dealer.current_dealer ==
        this.gameClobyosh.lowerHandPlayer) {
      console.log('Lower hand is dealer.');
      if (this.gameClobyosh.lowerHandPlayer == this.judgeClobyosh.opponent) {
        console.log('Lower hand is opponent.');
      }
      deck_pos = 1;
    } else {
      console.log('Upper hand is dealer.');
      if (this.gameClobyosh.upperHandPlayer == this.judgeClobyosh.opponent) {
        console.log('Upper hand is opponent.');
      }
      deck_pos = -1;
    }
    // Talk to the game engine ends

    this.marriageText =
        this.add
            .text(
                this.game.renderer.width / 2, this.game.renderer.height / 2,
                '#Placeholder#',
                {fontFamily: '"Arial"', fontSize: '40px', depth: 100})
            .setOrigin(0.5)
            .setVisible(false);


    //
    // Place the deck
    //

    //    this.snd_shuffle.play();
    for (let i = CARD_CLOBYOSH_IDS.length - 1; i > -1; i--) {
      let card_id = this.gameClobyosh.dealer.deck[i];

      this.spritesHash[card_id] = this.add.sprite(
          /*i * 15 +*/ 80 + (CARD_CLOBYOSH_IDS.length - i) / 3,
          this.game.renderer.height / 2 + (CARD_CLOBYOSH_IDS.length - i) / 3 +
              deck_pos * 200,
          'back');  // Create sprites, and display them outside the screen.
      this.spritesHash[card_id].setScale(1.00);
      this.spritesHash[card_id].setDepth(i);

      this.anims.create({
        key: 'anim_key_' + card_id,
        frames: [{key: card_id}, {key: 'back'}],
      });
      this.anims_hash[card_id] = this.anims.get('anim_key_' + card_id);
      this.spritesHash[card_id].setName(card_id);  // Sprite name
      this.spritesHash[card_id].on(
          'pointerdown', () => {this.cardIsPressed(this.spritesHash[card_id])},
          this);
    }
    this.deal();
  }

  /////////////////////////////////////////////////////////////////////
  // Deal the 12 cards to the upper and lower hands.
  /////////////////////////////////////////////////////////////////////
  deal() {
    this.max_depth = 4;
    let dealTween = [];
    let upper_x = 0;
    let lower_x = 0;
    let x_value = 0;
    console.log('Deck ' + this.gameClobyosh.dealer.deck);
    for (let i = CARD_CLOBYOSH_IDS.length - 1; i >= 20; i--) {
      let card_id = this.gameClobyosh.dealer.getTopCard();
      let y_base = 0;
      if ((Math.floor((i + 1) / 3) % 2 != 0 &&
           this.gameClobyosh.upperHandPlayer ==
               this.gameClobyosh.dealer.current_dealer) ||
          (Math.floor((i + 1) / 3) % 2 == 0 &&
           this.gameClobyosh.lowerHandPlayer ==
               this.gameClobyosh.dealer.current_dealer)) {
        this.gameClobyosh.upperHandPlayer.addCard(card_id);
        y_base = HAND_DIST_FROM_HORISONTAL_BORDERS;
        x_value = this.handDistFromVerticalBorder(true) +
            upper_x * HAND_DIST_BETWEEN_CARDS;
        upper_x++;
      } else {
        this.gameClobyosh.lowerHandPlayer.addCard(card_id);
        y_base = this.game.renderer.height - HAND_DIST_FROM_HORISONTAL_BORDERS;
        x_value = this.handDistFromVerticalBorder(true) +
            lower_x * HAND_DIST_BETWEEN_CARDS;
        lower_x++;
      }

      dealTween[i] = this.tweens.create({
        targets: this.spritesHash[card_id],
        y: y_base,
        x: x_value,
        duration: SPEED,
        ease: 'Linear',
        depth: CARD_CLOBYOSH_IDS.length + CARD_CLOBYOSH_IDS.length - i
      })

      dealTween[i].on('complete', () => {
        if (i >= 21) {  // The cards to be dealth
          dealTween[i - 1].play();
          //          this.snd_deal_card.play();
        } else {
          // Turn the lower hand cards to show front
          this.gameClobyosh.lowerHandPlayer.getHand().forEach(e => {
            this.showFront(e);
          });
          this.placeCardsNice();
          this.playCards();
        }
      });
    }
    dealTween[CARD_CLOBYOSH_IDS.length - 1].play();
    //    this.snd_deal_card.play();
  }

  playCards() {
    console.log('Upper hand ' + this.gameClobyosh.upperHandPlayer.getHand());
    console.log('Lower hand ' + this.gameClobyosh.lowerHandPlayer.getHand());

    if (this.judgeClobyosh.leader == this.gameClobyosh.upperHandPlayer) {
      //
      // Play upper hand to table
      //
      //      this.snd_play_upper_card.play();
      let upper_hand_card = this.judgeClobyosh.leader.getCard();
      this.judgeClobyosh.inMarriage = false;
      this.judgeClobyosh.setLeadCard(upper_hand_card);
      let ai_sprite = this.spritesHash[upper_hand_card];
      let playUpperToTable = this.tweens.add({
        targets: ai_sprite,
        y: this.game.renderer.height / 2,
        x: this.game.renderer.width / 2 +
            40 * -1,  // Place the card to the left
        duration: SPEED * 3,
        ease: 'Linear',
        depth: 0  // Depth 0 is set for the bottom card
      });

      this.showFront(upper_hand_card);
      playUpperToTable.on('complete', () => {
        this.setLowerHandInteractive();
        if (TEST) {
          let card_id = this.gameClobyosh.lowerHandPlayer.getCard();
          this.spritesHash[card_id].emit('pointerdown');
        }
      });
    } else {
      //
      // Play lower hand to table
      //
      this.setLowerHandInteractive();
      if (TEST) {
        let card_id = this.gameClobyosh.lowerHandPlayer.getCard();
        this.spritesHash[card_id].emit('pointerdown');
      }
    }
  }

  cardIsPressed(sprite) {
    console.log('Pointer down on card ' + sprite.name);
    let success = true;
    if (!TEST) {
      success = this.gameClobyosh.lowerHandPlayer.getCard(sprite.name);
    }
    if (success) {
      //      this.snd_play_card.play();
      this.judgeClobyosh.inMarriage = false;
      if (this.judgeClobyosh.leader == this.gameClobyosh.lowerHandPlayer) {
        this.judgeClobyosh.setLeadCard(sprite.name);
      } else {
        this.judgeClobyosh.setOpponentCard(sprite.name);
      }
      let playLowerToTable = this.tweens.add({
        targets: sprite,
        y: this.game.renderer.height / 2,
        x: this.game.renderer.width / 2,
        duration: SPEED * 3,
        ease: 'Linear',
        depth: 1
      });

      this.disableLowerHandInteractive();

      playLowerToTable.on('complete', () => {
        if (this.judgeClobyosh.leader == this.gameClobyosh.lowerHandPlayer) {
          this.playUpperHandAfterLowerHand();
        } else {
          this.getTrick();
        }
      });
    } else {  // The card pressed cannot be played.
      this.snd_wrong_card.play();
    }
  }

  playUpperHandAfterLowerHand() {
    //
    // Play upper hand to table
    //
    //    this.snd_play_upper_card.play();
    let upper_hand_card = this.judgeClobyosh.opponent.getCard();
    this.judgeClobyosh.inMarriage = false;
    this.judgeClobyosh.setOpponentCard(upper_hand_card);
    let ai_sprite = this.spritesHash[upper_hand_card];
    let playUpperToTable = this.tweens.add({
      targets: ai_sprite,
      y: this.game.renderer.height / 2,
      x: this.game.renderer.width / 2 + 40 * 1,  // Place the card to the left
      duration: SPEED * 3,
      ease: 'Linear',
      depth: 2  // Depth 1 is set for the top card
    });
    playUpperToTable.on('complete', () => {
      this.getTrick();
    });
    this.showFront(ai_sprite.name)
  }

  getTrick() {
    let winningPlayer = this.judgeClobyosh.getWinnerOfTrick();
    winningPlayer.addTrick([
      this.judgeClobyosh.getLeadCard(), this.judgeClobyosh.getOpponentCard()
    ]);
    this.showBack(this.judgeClobyosh.getLeadCard());
    this.showBack(this.judgeClobyosh.getOpponentCard());
    console.log(
        'Cards played: Lead card ' + this.judgeClobyosh.getLeadCard() +
        ' : Opponent card ' + this.judgeClobyosh.getOpponentCard());
    console.log('Upper hand: ' + this.gameClobyosh.upperHandPlayer.getHand());
    console.log('Lower hand: ' + this.gameClobyosh.lowerHandPlayer.getHand());
    let winner_y;
    if (winningPlayer == this.gameClobyosh.upperHandPlayer) {
      winner_y = TRICKS_FROM_HORISONTAL_BORDER +
          20 * this.gameClobyosh.upperHandPlayer.getNrOfTricks();
    } else {
      winner_y = this.game.renderer.height - TRICKS_FROM_HORISONTAL_BORDER -
          20 * this.gameClobyosh.lowerHandPlayer.getNrOfTricks();
    }

    this.max_depth++;
    let timer = this.time.delayedCall(SPEED * 4, () => {
      let twGetTrick = this.tweens.add({
        targets: [
          this.spritesHash[this.judgeClobyosh.leadCard],
          this.spritesHash[this.judgeClobyosh.opponentCard]
        ],
        x: this.game.renderer.width - TRICKS_FROM_VERTICAL_BORDER,
        y: winner_y,
        duration: SPEED * 3,
        ease: 'Linear',
        depth: this.max_depth,
        angle: 90
      });
      twGetTrick.on('complete', () => {
        // For first
        if (this.judgeClobyosh.firstPhase) {
          let leaderCard = this.gameClobyosh.dealer.getTopCard();
          this.judgeClobyosh.leader.addCard(leaderCard);
          let yValue;
          if (this.gameClobyosh.upperHandPlayer == this.judgeClobyosh.leader) {
            yValue = HAND_DIST_FROM_HORISONTAL_BORDERS;
          } else {
            yValue =
                this.game.renderer.height - HAND_DIST_FROM_HORISONTAL_BORDERS;
            this.setLowerHandInteractive();
            this.showFront(leaderCard);
          }
          let tw = this.tweens.add({
            targets: this.spritesHash[leaderCard],
            x: HAND_DIST_FROM_VERTICAL_BORDERS +
                this.gameClobyosh.upperHandPlayer.getHand().length *
                    HAND_DIST_BETWEEN_CARDS,
            y: yValue,
            duration: SPEED,
            depth: this.gameClobyosh.upperHandPlayer.getHand().length + 1
          });
          tw.on('complete', () => {
            let opponentCard = this.gameClobyosh.dealer.getTopCard();
            this.judgeClobyosh.opponent.addCard(opponentCard);
            let yValue;
            if (this.gameClobyosh.upperHandPlayer ==
                this.judgeClobyosh.opponent) {
              yValue = HAND_DIST_FROM_HORISONTAL_BORDERS;
            } else {
              yValue = this.game.renderer.height -
                  HAND_DIST_FROM_HORISONTAL_BORDERS;
              this.setLowerHandInteractive();
              this.showFront(opponentCard);
            }
            let tw = this.tweens.add({
              targets: this.spritesHash[opponentCard],
              x: HAND_DIST_FROM_VERTICAL_BORDERS +
                  this.gameClobyosh.upperHandPlayer.getHand().length *
                      HAND_DIST_BETWEEN_CARDS,
              y: yValue,
              duration: SPEED,
              depth: this.gameClobyosh.upperHandPlayer.getHand().length + 1
            });
            tw.on('complete', () => {
              this.judgeClobyosh.isEndOfFirstPhase();
              this.placeCardsNice();
              this.handleMarriage();
            });
          });

        } else if (!this.judgeClobyosh.isEndOfSecondPhase()) {
          if (this.gameClobyosh.lowerHandPlayer == this.judgeClobyosh.leader) {
            this.setLowerHandInteractive();
          }
          this.placeCardsNice();
          this.playCards();
        } else {
          let timer = this.time.delayedCall(SPEED * 4, () => {
            this.judgeClobyosh.setTotalPoints();
            this.scene.start('SCORE', {game: this.gameClobyosh});
          });
        }
      });
    });
  }

  handleMarriage() {
    let marriages = this.judgeClobyosh.getMarriageCandidates(
        this.judgeClobyosh.leader.getHand());
    if (marriages.length == 0) {
      this.playCards();
      return;
    }
    if (this.judgeClobyosh.leader == this.gameClobyosh.upperHandPlayer) {
      console.log('Upper hand can declare marriage in ' + marriages);
      this.disableLowerHandInteractive();
      this.judgeClobyosh.inMarriage = true;
      let m = this.judgeClobyosh.leader.getMarriage(marriages);
      this.judgeClobyosh.setMarriage(m);

      console.log('Upper hand declares marriage in ' + colorFullName(m));

      this.marriageText.setText('AI DECLARE MARRIAGE\nIN ' + colorFullName(m));
      this.marriageText.setVisible(true);
      let button_ok = this.add
                          .image(
                              this.game.renderer.width / 2,
                              this.game.renderer.height / 2 + 80, 'button_ok')
                          .setInteractive();
      button_ok.on('pointerdown', () => {
        this.marriageText.setVisible(false);
        button_ok.destroy();
        this.placeCardsNice();
        this.setLowerHandInteractive();
        this.playCards();
      });
      if (TEST) {
        button_ok.emit('pointerdown');
      }
    } else {  // Lower hand is leader
      console.log('Lower hand can declare marriage in ' + marriages);
      this.disableLowerHandInteractive();
      this.judgeClobyosh.inMarriage = true;
      this.marriageText.setText('DECLARE MARRIAGE IN');
      this.marriageText.setVisible(true);
      let yPos = this.game.renderer.height / 2 + 50;
      let xPos = HAND_DIST_FROM_VERTICAL_BORDERS + 20 - 170;
      let buttons = {};
      let button_none;
      marriages.forEach(e => {
        xPos += 170;
        let img_button = {
          'c': 'button_clubs',
          'd': 'button_diamonds',
          'h': 'button_hearts',
          's': 'button_spades'
        };
        buttons[e] = this.add.image(xPos, yPos, img_button[e])
                         .setInteractive()
                         .setScale(0.80);
        buttons[e].on('pointerdown', () => {
          this.judgeClobyosh.setMarriage(e);
          for (let key in buttons) {
            buttons[key].destroy();
          }
          button_none.destroy();
          this.marriageText.setVisible(false);
          this.placeCardsNice();
          this.setLowerHandInteractive();
          if (TEST) {
            this.playCards();
          }
        });
      });
      xPos += 170;
      button_none = this.add.image(xPos, yPos, 'button_none')
                        .setInteractive()
                        .setScale(0.80);
      button_none.on('pointerdown', () => {
        button_none.destroy();
        for (let key in buttons) {
          buttons[key].destroy();
          this.marriageText.setVisible(false);
        }
        this.judgeClobyosh.inMarriage = false;
        this.setLowerHandInteractive();
      });
      if (TEST) {
        let m = this.gameClobyosh.lowerHandPlayer.getMarriage(marriages);
        buttons[m].emit('pointerdown');
      }

    }  // Lower hand is leader

  }  // End of handleMarriage()

  placeCardsNice() {
    //    this.gameClobyosh.upperHandPlayer.sortHand();
    this.gameClobyosh.lowerHandPlayer.sortHand();

    if (this.gameClobyosh.upperHandPlayer.getHand().length == 0) {
      return;
    }

    let upperTween;
    let lowerTween;
    for (let i = 0; i < this.gameClobyosh.upperHandPlayer.getHand().length;
         i++) {
      upperTween = this.tweens.add({
        targets:
            this.spritesHash[this.gameClobyosh.upperHandPlayer.getHand()[i]],
        x: this.handDistFromVerticalBorder(false) +
            i * HAND_DIST_BETWEEN_CARDS,
        y: HAND_DIST_FROM_HORISONTAL_BORDERS,
        duration: SPEED / 2,
        ease: 'Linear',
        depth: i
      });

      lowerTween = this.tweens.add({
        targets:
            this.spritesHash[this.gameClobyosh.lowerHandPlayer.getHand()[i]],
        x: this.handDistFromVerticalBorder(false) +
            i * HAND_DIST_BETWEEN_CARDS,
        y: this.game.renderer.height - HAND_DIST_FROM_HORISONTAL_BORDERS,
        duration: SPEED / 2,
        ease: 'Linear',
        depth: i
      });
    }
  }

  setLowerHandInteractive() {
    this.gameClobyosh.lowerHandPlayer.getHand().forEach(e => {
      let s = this.spritesHash[e];
      if (s == undefined) {
        console.log(
            'Error. The card ' + e + ' is not on lower hand ' +
            this.gameClobyosh.lowerHandPlayer.getHand());
      }
      s.setInteractive();
    });
  }

  disableLowerHandInteractive() {
    this.gameClobyosh.lowerHandPlayer.getHand().forEach(e => {
      this.spritesHash[e].disableInteractive();
    });
  }

  showFront(card_id) {
    let anim = this.anims_hash[card_id];
    let frame;
    try {
      frame = anim.getFrameAt(FRONT_FRAME);
      this.spritesHash[card_id].anims.setCurrentFrame(frame);
    } catch (err) {
      console.log('ERROR: showFront' + err);
    }
  }

  showBack(card_id) {
    let anim = this.anims_hash[card_id];
    let frame;
    try {
      frame = anim.getFrameAt(BACK_FRAME);
      this.spritesHash[card_id].anims.setCurrentFrame(frame);
    } catch (err) {
      console.log('ERROR: showBack' + err);
    }
  }

  handDistFromVerticalBorder(inDeal) {
    let handLength;
    if (inDeal) {
      handLength = 6;
    } else {
      handLength = this.gameClobyosh.lowerHandPlayer.getHand().length;
    }
    let x = this.game.renderer.width / 2 -
        handLength / 2 * HAND_DIST_BETWEEN_CARDS + HAND_DIST_BETWEEN_CARDS / 2;
    return x;
  }
}
