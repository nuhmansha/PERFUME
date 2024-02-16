
async function validate(event) {
    event.preventDefault();

    const email = document.getElementById("email");
    const emailerror = document.getElementById('emailError');
    const myForm = document.getElementById('myForm'); 

    if (email.value.trim() == "") {
        emailerror.textContent = "Enter Email";
        clearError(emailerror, 2000); 
    } else if (/[0-9]/.test(email.value.charAt(0))) {
        emailerror.textContent = "Enter valid format";
        clearError(emailerror, 2000); 
    }else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)){
        emailerror.textContent = "Enter valid format";
        clearError(emailerror, 2000); 
    }    
     else {
        myForm.submit(); 
    }
}
function clearError(element, time) {
    setTimeout(() => element.textContent = "", time);
}

