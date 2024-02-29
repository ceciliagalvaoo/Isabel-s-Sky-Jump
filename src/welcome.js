// classe game over
class Welcome extends Phaser.Scene {
    // constructor
    constructor() {
        super({ key: 'Welcome' });
    }

    botaoStart;
    welcomeScene;
    // carregamento da imagem
    preload() {
        this.load.image('welcome', 'assets/welcome.png');
        this.load.image('botao_start', 'assets/botao_start.png');
	
    }
    // adição da imagem
    create() {
        // adiciona a imagem de bem vindo
	    this.welcomeScene = this.add.image(0, 0, 'welcome').setOrigin(0, 0).setScrollFactor(0)
        // adiciona botão de iniciar
        this.botaoStart = this.add.image(320, 636, 'botao_start').setScale(0.5);
        this.botaoStart.setDepth(3); 
        this.botaoStart.setInteractive(); 
        // Configurar evento para quando o botão é clicado
        this.botaoStart.on('pointerdown', () => { 
            
            this.scene.start('IndexScene');

        });
        // Configurar evento para quando o mouse está sobre o asset
        this.botaoStart.on('pointerover', () => {
            // Reduzir o tamanho do asset
            this.botaoStart.setScale(0.4);
        });
    
        // Configurar evento para quando o mouse não está mais sobre o asset
        this.botaoStart.on('pointerout', () => {
            // Restaurar o tamanho original do asset
            this.botaoStart.setScale(0.5);
        })
    }
}