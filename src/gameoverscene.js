// classe game over
class GameOverScene extends Phaser.Scene {
    // constructor
    constructor() {
        super({ key: 'GameOverScene' });
    }

    GameOverScene;
    // carregamento da imagem
    preload() {
        this.load.image('game_over', 'assets/game_over.png');
        this.load.image('playerGameOver0', 'assets/player_gameOver0.png');
		this.load.image('playerGameOver1', 'assets/player_gameOver1.png');
		this.load.image('playerGameOver2', 'assets/player_gameOver2.png');
       
    }
    // adição de conteúdos
    create() {
	    this.GameOverScene = this.add.image(0, 0, 'game_over').setOrigin(0, 0).setScrollFactor(0)
        // cria as animações do jogador quando ele perder
		this.anims.create({
			key: 'playerGameOver',
			frames: [{ key: 'playerGameOver0' }, { key: 'playerGameOver2' }, { key: 'playerGameOver1' }],
			frameRate: 5,
			repeat: -1,
		});
        // adiciona o jogador quando perde
        this.add.sprite(320, 300, 'playerGameOver').play('playerGameOver');
        
    }
}