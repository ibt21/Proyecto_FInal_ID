class UserManager {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.initEventListeners();
        this.checkExistingSession();
    }

    loadUsers() {
        const usersJSON = localStorage.getItem('tetrisUsers');
        return usersJSON ? JSON.parse(usersJSON) : {};
    }

    saveUsers() {
        localStorage.setItem('tetrisUsers', JSON.stringify(this.users));
    }

    register(username, email, password, age, color) {
        if (this.users[email]) {
            alert('Este email ya está registrado');
            return false;
        }

        this.users[email] = {
            username,
            email,
            password,
            age,
            color,
            bestScore: 0
        };

        this.saveUsers();
        return true;
    }

    login(email, password) {
        const user = this.users[email];
        if (user && user.password === password) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showGameScreen();
            this.updateUserPanel();
            return true;
        } else {
            alert('Email o contraseña incorrectos');
            return false;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showLoginScreen();
    }

    updateStats(score) {
        if (!this.currentUser) return;
        if (score > this.currentUser.bestScore) {
            this.currentUser.bestScore = score;
        }

        this.users[this.currentUser.email] = this.currentUser;
        this.saveUsers();
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        this.updateUserPanel();
    }

    updateUserPanel() {
        if (!this.currentUser) return;

        document.getElementById('user-welcome').textContent = `Bienvenido, ${this.currentUser.username}`;
        document.getElementById('best-score').textContent = this.currentUser.bestScore;
    }

    showProfile() {
        document.getElementById('profile-username').textContent = this.currentUser.username;
        document.getElementById('profile-email').textContent = this.currentUser.email;
        document.getElementById('profile-age').textContent = this.currentUser.age;
        document.getElementById('profile-color').textContent = this.currentUser.color;
        document.getElementById('profile-best').textContent = this.currentUser.bestScore;
        
        document.getElementById('profile-screen').style.display = 'flex';
        document.getElementById('game-container').style.display = 'none';
    }

    checkExistingSession() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showGameScreen();
            this.updateUserPanel();
        } else {
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('register-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('profile-screen').style.display = 'none';
    }

    showRegisterScreen() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('register-screen').style.display = 'flex';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('profile-screen').style.display = 'none';
    }

    showGameScreen() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('register-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';
        document.getElementById('profile-screen').style.display = 'none';
    }

    initEventListeners() {
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            this.login(email, password);
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const age = document.getElementById('register-age').value;
            const color = document.getElementById('register-color').value;

            if (this.register(username, email, password, age, color)) {
                alert('Registro exitoso. Ahora puedes iniciar sesión.');
                this.showLoginScreen();
            }
        });

        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterScreen();
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginScreen();
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('profile-btn').addEventListener('click', () => {
            this.showProfile();
        });

        document.getElementById('back-to-game').addEventListener('click', () => {
            this.showGameScreen();
        });
    }
}

export const userManager = new UserManager();