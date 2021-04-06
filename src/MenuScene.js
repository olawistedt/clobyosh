/** @type {import("../typings")} */

class RulesScene extends Phaser.Scene {
  constructor() {
    super({key: 'RULES'});
  }

  create() {
    let titleText =
        this.add.text(this.game.renderer.width / 2, 100, 'PARITY', {
          fontFamily: '"Arial"',
          fontSize: '100px',
        });
    titleText.setOrigin(0.5);

    let ruleString = 'Players: 2\n' +
        'Cards: 30\n' +
        'Card rank: 2-5-10-J-Q-K-A-Joker non trump color-Joker trump color\n\n' +
        'Goal: Get 100 points or more\n\n' +
        'You can get points by:\n' +
        '* Get the odd number of tricks, if parity is odd\n' +
        '* Get the even number of tricks, if the parity is even\n\n' +
        'Trumps\n' +
        '======\n' +
        'Non-dealer nominates the trump suit.\n\n' +
        'Object\n' +
        '======\n' +
        'Dealer state the target parity - that is, whether the object is to win\n' +
        'an odd or an even number of the 15 tricks to be played. (For this purpose\n' +
        'zero is even.)\n\n' +
        'Play\n' +
        '====\n' +
        'Non-dealer leads to the first trick. You must follow suit if you can, but may\n' +
        'play any card if you can\'t. The trick is taken by the higher card of the\n' +
        'suit led, or by the higher trump if any are played, and the winner of each\n' +
        'trick leads to the next.\n\n' +
        'Score\n' +
        '=====\n' +
        'Only the player who wins the required parity of tricks (odd or even) scores.\n' +
        'The score is 10 points for winning, plus 1 point for each trick won. Thus the\n' +
        'lowest possible score is 10 (target even, win 0 tricks) and the highest 25\n' +
        '(target odd, win all 15 tricks).\n\n' +
        'Reference: https://www.parlettgames.uk/oricards/parity.html';

    let ruleText = this.add.text(
        this.game.renderer.width / 2, this.game.renderer.height / 2,
        ruleString, {
          fontFamily: '"courier new"',
          fontSize: '20px',
        });
    ruleText.setOrigin(0.5);


    let button_ok = this.add
                        .image(
                            this.game.renderer.width / 2,
                            this.game.renderer.height - 200, 'button_ok')
                        .setInteractive();
    button_ok.on('pointerdown', () => {
      this.scene.start('MENU');
    });
  }
}

class CreditsScene extends Phaser.Scene {
  constructor() {
    super({key: 'CREDITS'});
  }

  create() {
    let titleText =
        this.add.text(this.game.renderer.width / 2, 100, 'CREDITS', {
          fontFamily: '"Arial"',
          fontSize: '100px',
        });
    titleText.setOrigin(0.5);

    let creditString = 'The Game\n' +
        '========\n' +
        'The game Parity is invented by David Parlett\n\n' +
        'Playing cards\n' +
        '=============\n' +
        'Playing card images were made by Nicu Buculei http://nicubunu.ro/\n\n' +
        'Game Framework\n' +
        '==============\n' +
        'Phaser 3: https://phaser.io/phaser3\n\n' +
        'Cloth background\n' +
        '================\n' +
        'Unknown great graphics designer\n\n' +
        'Inspiration\n' +
        '===========\n' +
        'Andreas Nilsson\n\n' +
        'Sounds\n' +
        '======\n' +
        'All sounds is made by Ola Wistedt\n\n' +
        'Sound Effects\n' +
        '=============\n' +
        'TAL-NoiseMaker https://tal-software.com/products/tal-noisemaker\n\n' +
        'Code\n' +
        '====\n' +
        'This program is written by Ola Wistedt\n\n';

    let creditText = this.add.text(
        this.game.renderer.width / 2, this.game.renderer.height / 2,
        creditString, {
          fontFamily: '"courier new"',
          fontSize: '20px',
        });
    creditText.setOrigin(0.5);


    let button_ok = this.add
                        .image(
                            this.game.renderer.width / 2,
                            this.game.renderer.height - 200, 'button_ok')
                        .setInteractive();
    button_ok.on('pointerdown', () => {
      this.scene.start('MENU');
    });
  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super({key: 'MENU'});
    this.level = 3;
  }

  preload() {
    this.load.image('cloth', 'assets/tilesets/bgslagrn.jpg');
    this.load.audio('theme', ['assets/sound/Theme3.mp3']);
    this.load.audio('wrong_card', ['assets/sound/wrong_card.mp3']);
    this.load.image('button_ok', 'assets/buttons/button_ok.png');
    this.load.image('rules_button', 'assets/buttons/button_rules.png');
    this.load.image('credits_button', 'assets/buttons/button_credits.png');
    this.load.image('play_game_button', 'assets/buttons/button_play-game.png');
    this.load.image('level_1_button', 'assets/buttons/button_level_1.png');
    this.load.image('level_2_button', 'assets/buttons/button_level_2.png');
    this.load.image('level_3_button', 'assets/buttons/button_level_3.png');
  }

  create() {
    //    this.add.tileSprite(400, 300, 2400, 1600, 'duk');
    let tile = this.add.tileSprite(
        0, 0, this.game.renderer.width * 2, this.game.renderer.height * 2,
        'cloth');  // Add the background

    let titleText = this.add.text(
        this.game.renderer.width / 2, this.game.renderer.height / 2 - 280,
        'PARITY', {
          fontFamily: '"Arial"',
          fontSize: '100px',
        });
    titleText.setOrigin(0.5);

    let rules_button = this.add.image(
        this.game.renderer.width / 2, this.game.renderer.height / 2 - 100,
        'rules_button');
    rules_button.setInteractive();
    rules_button.on('pointerdown', () => {
      this.scene.start('RULES');
    });

    let credits_button = this.add.image(
        this.game.renderer.width / 2, this.game.renderer.height / 2,
        'credits_button');
    credits_button.setInteractive();
    credits_button.on('pointerdown', () => {
      this.scene.start('CREDITS');
    });

    this.level_button = this.add.sprite(
        this.game.renderer.width / 2, this.game.renderer.height / 2 + 100,
        'level_' + this.level.toString() + '_button');
    this.level_button.setInteractive();
    this.level_button.on('pointerdown', () => {
      this.level += 1;
      if (this.level > 3) {
        this.level = 1;
      }
      let anim = this.anims.get('anim_key_level');
      let frame = anim.getFrameAt(this.level - 1);
      this.level_button.anims.setCurrentFrame(frame);
    });
    this.anims.create({
      key: 'anim_key_level',
      frames: [
        {key: 'level_1_button'}, {key: 'level_2_button'},
        {key: 'level_3_button'}
      ],
    });

    let play_button = this.add.image(
        this.game.renderer.width / 2, this.game.renderer.height / 2 + 200,
        'play_game_button');
    play_button.setInteractive();
    play_button.on('pointerdown', () => {
      this.scene.start('PLAY', {caller: 'menu', level: this.level});
    });
    if (TEST) {
      play_button.emit('pointerdown');
    }
  }
}
