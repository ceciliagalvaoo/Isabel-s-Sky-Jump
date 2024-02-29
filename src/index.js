// classe da cena inicial
class IndexScene extends Phaser.Scene {
	// construtor
	constructor() {
		super({
			key: 'IndexScene',
		});

	}
	
	// variáveis globais
	player;
	platforms;
	enemies;
	ball;

	leftKey;
	rightKey;

	gameOverDistance = 0;
	gameOver = false;

	score = 0;
	scoreText;
	scoreMax;


	// carregamento das imagens
	preload() {
		this.load.image('background_img', 'assets/background.png');
		this.load.image('playerSprite', 'assets/player.png');
		this.load.image('playerJumpSprite', 'assets/player_jump.png');
		this.load.image('playerLeftSprite', 'assets/player_left_jump.png');
		this.load.image('playerRightSprite', 'assets/player_right_jump.png');
		this.load.image('platform', 'assets/game-tiles.png');
		this.load.image('enemy', 'assets/enemy_default.png');
		this.load.spritesheet('enemyAnims', 'assets/enemy.png', { frameWidth: 161, frameHeight: 95 });
		this.load.image('ball', 'assets/Parsnip.png');
	}

	// adição e criação do jogo
	create() {
		// adiciona a imagem de fundo
		this.add.image(0, 0, 'background_img').setOrigin(0, 0).setScrollFactor(0)
		// cria o texto da pontuação
		this.scoreText = this.add
			.text(20, 60, 'Pontuação: 0', { fontSize: '32px', fill: '#fff' })
			.setScrollFactor(0)
			.setDepth(5)
		// cria o texto da pontuação máxima
		this.scoreMax = this.add
			.text(20, 20, `Pontuação Máxima: ${localStorage.getItem('maxScore')}`, { fontSize: '32px', fill: '#fff' })
			.setScrollFactor(0)
			.setDepth(5)
		
		// cria as animações do jogador quando ele pular
		this.anims.create({
			key: 'jump',
			frames: [{ key: 'playerJumpSprite' }, { key: 'playerSprite' }],
			frameRate: 10,
			repeat: 0
		});
		// cria as animações do jogador quando ele virar para a esquerda
		this.anims.create({
			key: 'left',
			frames: [{ key: 'playerLeftSprite' }],
			frameRate: 10,
			repeat: -1
		});
		// cria as animações do jogador quando ele virar para a direita
		this.anims.create({
			key: 'right',
			frames: [{ key: 'playerRightSprite' }],
			frameRate: 10,
			repeat: -1
		});
		// cria as animações do jogador quando ele ficar parado
		this.anims.create({
			key: 'turn',
			frames: [{ key: 'playerSprite' }],
			frameRate: 20,
			repeat: 0,
			
		});

		// cria as animações do inimigo	
		this.anims.create({
			key: 'enemy',
			frames: 'enemyAnims',
			frameRate: 10,
			repeat: -1,
			yoyo: true,
		});

		// cria a fisica do jogo
		this.createPlayer(this.physics)
		this.createPlatforms(this.physics)
		this.createEnemies(this.physics)
		this.createBall(this.physics)

		// verifica a colisão entre o jogador e a plataforma, acionando o ato de pular
		this.physics.add.collider(this.player, this.platforms, (playerObj, platformObj) => {
			if (platformObj.body.touching.up && playerObj.body.touching.down) {
				this.player.setVelocityY(-500)
				this.player.anims.play('jump', true)
			}
		})

		// verifica a colisão entre as plataformas, para que elas não se sobreponham
		this.physics.add.collider(this.platforms, this.platforms, collider => {
			collider.x = Phaser.Math.Between(0, 640)
			collider.refreshBody()
		})
	
		// verifica a colisão entre o jogador e o inimigo, acionando o game over
		this.physics.add.collider(this.player, this.enemies, (_, enemy) => {
			this.physics.pause()
			enemy.anims.stop()
			this.player.anims.play('playerGameOver', true)
			this.gameOver = true
			this.comecarProximaCena("GameOverScene");
		})

		// verifica a colisão entre as plataformas e o inimigo, para que eles não se sobreponham
		this.physics.add.collider(this.platforms, this.enemies, collider => {
			collider.x = Phaser.Math.Between(0, 640)
			collider.refreshBody()
		})
		// verifica a colisão entre o jogador e a comida, acionando o ato de pular mais alto
		this.physics.add.collider(this.player, this.ball, (playerObj, ballObj) => {
			if (ballObj.body.touching && playerObj.body.touching) {
				ballObj.disableBody(true, true)
				this.score += 100
				this.scoreText.setText('Pontuação: ' + this.score)
				this.player.setVelocityY(-1000)
				this.player.anims.play('jump', true)
			}
		})

		// verifica a colisão entre as plataformas e a comida, para que elas não se sobreponham
		this.physics.add.collider(this.platforms, this.ball, collider => {
			collider.x = Phaser.Math.Between(0, 640)
			collider.refreshBody()
		})
		
		// verifica a colisão entre o inimigo e a comida, para que eles não se sobreponham
		this.physics.add.collider(this.enemies, this.ball, collider => {
			collider.x = Phaser.Math.Between(0, 640)
			collider.refreshBody()
		})
		// acompanha o jogador ao longo do jogo
		this.cameras.main.startFollow(this.player, false, 0, 1)
		// cria as teclas de movimento (uso do teclado)
		this.createKeys(this.input.keyboard)

	}

	// atualização do jogo em tempo real
	update() {

		// verifica a movimentação do jogador
		this.checkMovement()
		this.newPlatforms()
		this.newEnemies()
		this.newSnack()
		this.checkIfFall(this.physics)
		this.updateScore()
	}

	// funções auxiliares do jogador
	createPlayer(physics) {
		//// animações específicas do jogador
		this.player = physics.add.sprite(325, -100, 'playerSprite')
		this.player.setBounce(0, 1)
		this.player.setVelocityY(-300)
		this.player.body.setSize(56, 90)
		this.player.body.setOffset(-2, 0)
		this.player.setDepth(10)
	}

	// funções auxiliares da plataforma
	createPlatforms(physics) {
		// criação de plataformas estáticas
		this.platforms = physics.add.staticGroup()
		// posição vertical definida para todas as plataformas
		this.platforms.create(325, 0, 'platform')
		// posição horizontal definida aleatoriamente para cada plataforma
		this.platforms.create(Phaser.Math.Between(0, 640), -200, 'platform')
		this.platforms.create(Phaser.Math.Between(0, 640), -400, 'platform')
		this.platforms.create(Phaser.Math.Between(0, 640), -600, 'platform')
		this.platforms.create(Phaser.Math.Between(0, 640), -800, 'platform')
		this.platforms.create(Phaser.Math.Between(0, 640), -1000, 'platform')
		this.platforms.create(Phaser.Math.Between(0, 640), -1200, 'platform')
		this.platforms.create(Phaser.Math.Between(0, 640), -1400, 'platform')
		this.platforms.create(Phaser.Math.Between(0, 640), -1600, 'platform')
		this.platforms.create(Phaser.Math.Between(0, 640), -1800, 'platform')
		this.platforms.create(Phaser.Math.Between(0, 640), -2000, 'platform')
		this.platforms.create(Phaser.Math.Between(0, 640), -2200, 'platform')
		this.platforms.create(Phaser.Math.Between(0, 640), -2400, 'platform')
		
	}

	// funções auxiliares do inimigo
	createEnemies(physics) {
		// criação de inimigos
		this.enemies = physics.add.group()
		// o inimigo será criado em uma posição aleatória
		this.enemies.create(Phaser.Math.Between(0, 640), Phaser.Math.Between(-1350, -1800), 'enemy')
		// animações específicas do inimigo
		this.enemies.children.iterate(function (enemy) {
			enemy.body.setSize(60, 60)
			enemy.body.setOffset(50, 10)
			enemy.body.setAllowGravity(false)
			enemy.anims.play('enemy')
		})
	}
	// funções auxiliares da comida
	createBall(physics) {
		// criação de comida
		this.ball = physics.add.group()
		// a comida será criada em uma posição aleatória
		this.ball.create(Phaser.Math.Between(0, 640), Phaser.Math.Between(-450, -980), 'ball')
		//animações específicas da comida
		this.ball.children.iterate(function (balls) {
			balls.body.setSize(30, 30)
			balls.body.setAllowGravity(false)
		})
	}

	// funções auxiliares do teclado
	createKeys(keyboard) {
		this.leftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT, true, true)
		this.rightKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT, true, true)
	}

	// funções auxiliares do movimento
	checkMovement() {
		// velocidade horizontal para a esquerda
		if (this.leftKey.isDown && !this.rightKey.isDown) {
			this.player.setVelocityX(-350)
			this.player.anims.play('left', true)
			if (this.player.x < 15) {
				this.player.x = 615
			}
		}
		// velocidade horizontal para a direita
		if (this.rightKey.isDown && !this.leftKey.isDown) {
			this.player.setVelocityX(350)
			this.player.anims.play('right', true)
			if (this.player.x > 615) {
				this.player.x = 25
			}
		}

		// velocidade horizontal nula
		if (!this.leftKey.isDown && !this.rightKey.isDown) {
			this.player.setVelocityX(0)

		}
	}


	// atualiza as plataformas que vão aparecendo para o jogador
	newPlatforms() {
		let minY = 0;
		// posição Y das plataformas
		this.platforms.children.iterate((platform) => {
			if (platform.y < minY) minY = platform.y;
		});
	
		const playerY = this.player.y; // Adicionar jogador na posição Y
		const minYThreshold = -200; // Limite inferior para adicionar novas plataformas
		const maxYThreshold = minY - 800; // Limite superior para adicionar novas plataformas

		// verifica se o jogador está acima do limite inferior da plataforma
		if (playerY < minYThreshold) {
			const newPlatform = this.platforms.create(
				Phaser.Math.Between(0, 640),
				minY - 200,
				'platform'
			);
			newPlatform.refreshBody();
		}
	
		// remover plataformas que estão acima do jogador
		this.platforms.children.iterate((platform) => {
			if (platform.y < maxYThreshold) {
				platform.destroy();
			}
		});
		// desabilitar colisão com as plataformas nos lados e em baixo
		this.platforms.children.iterate(function (platform) {
			platform.body.checkCollision.down = false
			platform.body.checkCollision.left = false
			platform.body.checkCollision.right = false
		})
	}
	

	// atualiza os inimigos que vão aparecendo para o jogador
	newEnemies() {
		// Adicionar jogador na posição Y
		const playerY = this.player.y;
		const minYThreshold = -200; // Limite inferior para adicionar novos inimigos
		// Adiciona novos inimigos
		this.enemies.children.iterate((enemy) => {
			if (enemy.y > playerY && enemy.y - playerY > 700) {
				enemy.x = Phaser.Math.Between(0, 640);
				enemy.y = enemy.y - Phaser.Math.Between(1600, 2000);
				enemy.enableBody(true, enemy.x, enemy.y, true, true);
			}
		});
	}
	
	
	// atualiza as comidas que vão aparecendo para o jogador
	newSnack() {
		// Adicionar jogador na posição Y
		const playerY = this.player.y;
		const minYThreshold = -200; // Limite inferior para adicionar novas comidas
		// Adiciona novas comidas
		this.ball.children.iterate((ball) => {
			if (ball.y > playerY && ball.y - playerY > 700) {
				ball.x = Phaser.Math.Between(0, 640);
				ball.y = ball.y - Phaser.Math.Between(1600, 2000);
				ball.enableBody(true, ball.x, ball.y, true, true);
			}
		});
	}
	

	// verifica se o jogador caiu
	checkIfFall(physics) {
		// jogador perde
		if (this.player.body.y > this.gameOverDistance) {
			physics.pause()
			this.gameOver = true
			this.comecarProximaCena("GameOverScene");
		} else if (this.player.body.y * -1 - this.gameOverDistance * -1 > 700) {
			this.gameOverDistance = this.player.body.y + 700
		}
	}
	// atualiza a pontuação do jogador
	updateScore() {
		if (this.player.y * -1 > this.score) {
			this.score += 10
			this.scoreText.setText('Pontuação: ' + this.score)
		}
		this.storeMaxScore()

	}
	// armazena a pontuação máxima do jogador
	storeMaxScore() {
		if (localStorage.getItem('maxScore') < this.score) {
			localStorage.setItem('maxScore', this.score)
			this.scoreMax.setText(`Pontuação Máxima: ${localStorage.getItem('maxScore')}`)
			}
		}

	// Começa a próxima cena
	comecarProximaCena(cena) {
	    this.scene.start(cena);
	};

}
