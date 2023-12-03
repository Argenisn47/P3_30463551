const registerButton = document.getElementById('register'); /*Boton al presionar que no tiene usuario*/
const registerColor = document.getElementById('register-color'); /*Color del div*/
const loginColor = document.getElementById('login-color'); /*Color del div*/
const loginContent = document.getElementById('login-content'); /*Formulario login*/
const loginButton = document.getElementById('login'); /*Boton al presionar que tiene usuario*/
const registerContent = document.getElementById('register-content'); /*Formulario registro*/
const contentFather = document.getElementById('Content-father'); /*Contenido padre de todos los elementos*/
const svgiconeyeVisible = document.getElementById('eye__visible'); /*EyeVisibleLogin*/
const svgiconeyeHidden = document.getElementById('eye__hidden'); /*EyeHiddenLogin*/
const inputPasswordRegister = document.getElementById('input__password__register'); /*InputPassword*/
const inputPassword = document.getElementById('input__password'); /*InputLogin*/
const inputUser = document.getElementById('input__user'); /*Input user*/
const eyesLogin = document.getElementById('eyes_login'); /*EyesDivLogin*/


svgiconeyeVisible.addEventListener('click', () => {
    inputPassword.type = 'text';
    svgiconeyeVisible.style.opacity = '0';
    svgiconeyeVisible.style.pointerEvents = 'none';

    svgiconeyeHidden.style.opacity = '1';
    svgiconeyeHidden.style.pointerEvents = 'all';
})

svgiconeyeHidden.addEventListener('click', () => {
    inputPassword.type = 'password';
    svgiconeyeHidden.style.opacity = '0';
    svgiconeyeHidden.style.pointerEvents = 'none';

    svgiconeyeVisible.style.opacity = '1';
    svgiconeyeVisible.style.pointerEvents = 'all';
})

inputPassword.addEventListener('input', () => {
    inputPassword.value.length > 0 ? eyesLogin.style.opacity = '1' : eyesLogin.style.opacity = '0';
})


const openLogin = () => {
    contentFather.classList.replace("close", "open");
}

const logincolorDiv = () => {
    registerColor.style.backgroundColor = "black";
    loginColor.style.backgroundColor = "#DC3535";
}



const HiddenEye = () => {
    eyesRegister.style.display = 'none';
    eyesRegister.style.opacity = '0';
    eyesLogin.style.display = 'block';
    eyesLogin.style.opacity = '0';
}

const VisibleEye = () => {
    eyesRegister.style.display = 'block';
    eyesRegister.style.opacity = '0';
    eyesLogin.style.display = 'none';
    eyesLogin.style.opacity = '0';
}


const clearInputLogin = () => {
    inputPassword.value = ''
    inputUser.value = ''
}

loginButton.addEventListener('click', () => {
    /*Aparece el login*/
    
    loginContent.style.opacity = "1";
    loginContent.style.pointerEvents = "all";
    contentFather.classList.remove('open');
    contentFather.classList.add('close');
    
    /*Desaparecer registro*/
    registerContent.style.opacity = "0";
    registerContent.style.pointerEvents = "none";  
    if(inputPasswordRegister.value.length > 0 || inputuserRegister.value.length > 0){
        setTimeout(clearInputRegister,1450)
    }

    /*Temporizador para qué reemplazar la animacion cerrada(close) al abierta(open)*/
    setTimeout(openLogin,1000); 
    setTimeout(HiddenEye,1450);
    setTimeout(logincolorDiv,1000);

})
