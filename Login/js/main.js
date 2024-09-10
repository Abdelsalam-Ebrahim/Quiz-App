const nameRegex = /^[A-Za-z]{3,14}$/;
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{6,}$/;
const reader = new FileReader();


class FormValidator {
    constructor() {
        this.firstInput = document.querySelector("#firstlabel");
        this.secondtInput = document.querySelector("#Secondlabel");
        this.formButton = document.querySelector(".box1 button");
        this.checked = false;
        this.arrOfRegex = [nameRegex, emailRegex, passwordRegex];
        this.currRegex = 0;
    }

    init() {
        window.addEventListener("load", () => {
            if (sessionStorage.getItem("login")) {
                window.location.replace("./quiz.html");
            } else {
                localStorage.clear();
                this.formButton.addEventListener("click", () => this.check());
                this.validateInputs();
            }
        });
    }

    validate(input) {
        input.addEventListener("input", () => {
            if (this.currRegex >= 3) return;

            if (input.type == "file") {
                reader.onload = (event) => {
                    let fileURL = event.target.result;
                    localStorage.setItem("photo", fileURL);
                    let myimg = document.createElement("img");
                    myimg.src = fileURL;
                    myimg.style.maxWidth = "200px";
                    input.parentElement.parentElement.append(myimg);
                };
                reader.readAsDataURL(input.files[0]);
                return;
            }

            let errorDiv1 = document.createElement("p");
            let parent = input.parentElement.parentElement;

            if (this.currRegex === 0) {
                errorDiv1.textContent = "At least 3 letters and without spaces";
            } else if (this.currRegex === 1) {
                errorDiv1.textContent = "please enter a valid email";
            } else if (this.currRegex === 2) {
                errorDiv1.textContent = "Your password must be at least 6 characters long and include at least one uppercase letter, one number, and one special character";
                errorDiv1.style.fontSize = "12px";

                if (input === this.secondtInput && this.firstInput.value !== this.secondtInput.value) {
                    errorDiv1.textContent = "does not match";
                }
            }

            if (this.arrOfRegex[this.currRegex].test(input.value)) {
                input.style.border = "3px solid green";
                this.checked = true;

                if (parent.children.length > 1) {
                    parent.children[1].remove();
                }

                if (this.currRegex === 0) {
                    if (this.secondtInput.value === "" || this.firstInput.value === "") this.checked = false;
                } else if (this.currRegex === 2) {
                    if (this.secondtInput.value === "" || this.firstInput.value === "") this.checked = false;

                    let parentSe = this.secondtInput.parentElement.parentElement;

                    if (this.firstInput.value !== this.secondtInput.value) {
                        if (this.secondtInput.value) {
                            if (parentSe.children.length == 1) parentSe.append(errorDiv1);
                            this.secondtInput.style.border = "3px solid red";
                            errorDiv1.textContent = "does not match";
                            this.checked = false;
                        }
                    } else {
                        if (parentSe.children.length > 1) parentSe.children[1].remove();
                        this.secondtInput.style.border = "3px solid green";
                    }
                }
            } else {
                input.style.border = "3px solid red";
                if (parent.children.length == 1) {
                    parent.append(errorDiv1);
                }
                this.checked = false;
            }
        });
    }

    validateInputs() {
        this.validate(this.firstInput);
        this.validate(this.secondtInput);
    }

    clearInputs() {
        this.firstInput.value = "";
        this.secondtInput.value = "";
        this.firstInput.style.borderColor = "#919191";
        this.secondtInput.style.borderColor = "#919191";
    }

    goSecond() {
        this.firstInput.placeholder = "Enter Your Email";
        this.secondtInput.type = "file";
        this.secondtInput.placeholder = "";
        this.secondtInput.style.border = "none";
        this.secondtInput.accept = "image/*";
    }

    goThird() {
        this.firstInput.placeholder = "Enter Your password";
        this.firstInput.type = "password";
        this.secondtInput.type = "password";
        this.secondtInput.placeholder = "Re Password";
        this.secondtInput.style.border = "2px solid #919191";

        this.eyePassword();

        if (document.querySelector("img")) document.querySelector("img").remove();
    }

    eyePassword() {
        let eye_1 = this.firstInput.parentElement.children[1];
        let eye_2 = this.secondtInput.parentElement.children[1];

        eye_1.style.display = "block";
        eye_2.style.display = "block";

        eye_1.addEventListener("click", () => this.showPassword(eye_1, this.firstInput));
        eye_2.addEventListener("click", () => this.showPassword(eye_2, this.secondtInput));
    }

    showPassword(eye, input) {
        if (input.type === 'password') {
            input.type = "text";
            eye.className = "fa-regular fa-eye";
        } else {
            input.type = "password";
            eye.className = "fa-regular fa-eye-slash";
        }
    }

    goLogin() {
        this.firstInput.parentElement.children[1].style.display = "none";
        this.firstInput.type = "text";
        this.firstInput.placeholder = "Enter Your Email";
        this.secondtInput.placeholder = "Enter your password";

        document.querySelector(".mainbox").style.flexDirection = "row-reverse";
        this.formButton.textContent = "Login";
        document.querySelector(".steps").innerHTML = "<p>Login to Quiz app</p>";
        document.querySelector(".box2 p").textContent = "Please login";
        document.querySelector(".box2 h3").textContent = "Welcome To Our Site";
    }

    goQuiz() {
        if (this.firstInput.value === localStorage.getItem("email") && this.secondtInput.value === localStorage.getItem("password")) {
            sessionStorage.setItem("login", true);
            setTimeout(() => {
                window.location.replace("./quiz.html");
            }, 800);
        } else {
            let divErrorLogin = document.createElement("p");

            if (this.firstInput.value === "" && this.secondtInput.value === "") {
                this.firstInput.style.border = "3px solid red";
                this.secondtInput.style.border = "3px solid red";
            } else if (this.firstInput.value !== localStorage.getItem("email")) {
                divErrorLogin.textContent = "this email does not exist";
                this.firstInput.style.border = "3px solid red";
                this.secondtInput.style.border = "3px solid var(--mainColor)";
                if (this.secondtInput.parentElement.parentElement.children.length > 1) {
                    this.secondtInput.parentElement.parentElement.children[1].remove();
                }
                if (this.firstInput.parentElement.parentElement.children.length === 1) {
                    this.firstInput.parentElement.parentElement.append(divErrorLogin);
                }
            } else {
                divErrorLogin.textContent = "incorrect password";
                this.secondtInput.style.border = "3px solid red";
                this.firstInput.style.border = "3px solid var(--mainColor)";
                if (this.firstInput.parentElement.parentElement.children.length > 1) {
                    this.firstInput.parentElement.parentElement.children[1].remove();
                }
                if (this.secondtInput.parentElement.parentElement.children.length === 1) {
                    this.secondtInput.parentElement.parentElement.append(divErrorLogin);
                }
            }
        }
    }

    check() {
        if (this.checked) {
            this.animation();
            if (this.currRegex === 0) {
                localStorage.setItem("firstName", this.firstInput.value);
                localStorage.setItem("secondName", this.secondtInput.value);
                this.clearInputs();
                this.goSecond();
                this.checked = false;
            } else if (this.currRegex === 1) {
                localStorage.setItem("email", this.firstInput.value);
                this.clearInputs();
                this.goThird();
                this.checked = false;
            } else if (this.currRegex === 2) {
                localStorage.setItem("password", this.firstInput.value);
                this.clearInputs();
                this.goLogin();
            } else {
                this.goQuiz();
            }


            if (this.currRegex < 2) {
                document.querySelector(`.steps span:nth-child(${this.currRegex + 1})`).className = "active";
                document.querySelectorAll(".steps span")[this.currRegex].innerHTML = "<i class='fa-solid fa-check'><i/>";
            }
            this.currRegex++;
        } else {
            if (this.currRegex !== 1) {
                if (this.firstInput.value === "") this.firstInput.style.border = "3px solid red";
                if (this.secondtInput.value === "") this.secondtInput.style.border = "3px solid red";
            } else {
                this.firstInput.style.border = "3px solid red";
            }
        }
    }

    animation() {
        this.animateOut();
        this.animateIn();
    }

    animateOut() {
        document.querySelector(".box1").classList.add("slide-in-right");
        setTimeout(() => {
            document.querySelector(".box1").classList.remove("slide-in-right");
        }, 300);
    }

    animateIn() {
        document.querySelector(".box2").classList.add("slide-out-left");
        setTimeout(() => {
            document.querySelector(".box2").classList.remove("slide-out-left");
        }, 300);
    }
}


let osos_3bosa = new FormValidator();
osos_3bosa.init();

// localStorage.clear();
// sessionStorage.clear();