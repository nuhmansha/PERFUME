
var clipboard = new ClipboardJS('#copyButton');

clipboard.on('success', function (e) {
    console.log('Text successfully copied to clipboard:', e.text);
});







//delete address
function deleteAddress(addressId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to delete this address.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
    }).then((result) => {
        if (result.isConfirmed) {
            const data = { id: addressId };

            fetch('/deleteaddress', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then(response => response.json())
                .then((response) => {
                    if (response.deleted == true) {
                        // Reload the specified div after successful deletion
                        $('#addrassArea').load('/account #addrassArea');
                        Swal.fire({
                            icon: 'success',
                            title: 'Address Deleted!',
                            text: 'The address has been successfully deleted.',
                        });
                    } else {
                        // Handle other cases or errors here
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: response.message,
                        });
                    }
                })
                .catch(error => {
                    console.error('Error deleting address:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Failed to delete the address. Please try again.',
                    });
                });
        }
    });
}


//add address
$(document).ready(function () {
    $('#submitAddressBtn').on('click', function () {
        if (validateForm()) {
            var formData = $('#addAddressForm').serialize();
            console.log(formData);

            $.ajax({
                type: 'POST',
                url: '/addaddresses',
                data: formData,
                success: function (response) {
                    console.log(response);
                    if (response.add == true) {
                        $('#addrassArea').load('/account #addrassArea');
                        $('#addAddressModal').modal('hide');
                        $('.modal-backdrop').remove();
                        Swal.fire({
                            icon: 'success',
                            title: 'Address Added Successfully',
                            text: 'Your address has been added successfully.',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'There was a problem adding your address!',
                        });
                    }
                },
                error: function (error) {
                    console.error('Error:', error);
                }
            });
        }
    });

	function validateForm() {
    var fullName = $('#fullName').val().trim();
    var country = $('#country').val().trim();
    var housename = $('#housename').val().trim();
    var state = $('#state').val().trim();
    var city = $('#city').val().trim();
    var pincode = $('#pincode').val().trim();
    var phone = $('#phone').val().trim();
    var email = $('#email').val().trim();

    $('.error-message').remove();

    var isValid = true;

    if (fullName === '') {
        displayError('#fullName', 'Please enter your full name.');
        isValid = false;
    }

    if (country === '') {
        displayError('#country', 'Please enter the country.');
        isValid = false;
    }

    if (housename === '') {
        displayError('#housename', 'Please enter the house name.');
        isValid = false;
    }

    if (state === '') {
        displayError('#state', 'Please enter the state.');
        isValid = false;
    }

    if (city === '') {
        displayError('#city', 'Please enter the city.');
        isValid = false;
    }

	if (pincode === '') {
        displayError('#pincode', 'Please enter the pincode.');
        isValid = false;
     } else if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
       displayError('#pincode', 'Please enter a valid 6-digit pincode with only digits.');
       isValid = false;
}

if (phone === '') {
    displayError('#phone', 'Please enter the phone number.');
    isValid = false;
} else if (phone.length !== 10 || !/^\d+$/.test(phone)) {
    displayError('#phone', 'Please enter a valid 10-digit phone number with only digits.');
    isValid = false;
}


    if (email === '') {
        displayError('#email', 'Please enter the email.');
        isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        displayError('#email', 'Please enter a valid email address.');
        isValid = false;
    }

    function displayError(elementId, message) {
        clearError(elementId);
        $(elementId).after('<div class="error-message text-danger">' + message + '</div>');
    }

    function clearError(elementId) {
        $(elementId).next('.error-message').remove();
    }

    return isValid;
}


  });




//edit address
function showEditAddressModal(fullName, country, housename, state, city, pincode, phone, email, addressId) {
    document.getElementById('fullNames').value = fullName;
    document.getElementById('countrys').value = country;
    document.getElementById('housenames').value = housename;
    document.getElementById('states').value = state;
    document.getElementById('citys').value = city;
    document.getElementById('pincodes').value = pincode;
    document.getElementById('phones').value = phone;
    document.getElementById('emails').value = email;
    document.getElementById('addressId').value = addressId;

    $('#addAddressModals').modal('show');
}

$('#submitAddressBtns').on('click', function () {
    const formData = $('#addAddressForms').serialize();
    console.log(formData);

    $.ajax({
        type: 'POST',
        url: '/editaddresses',
        data: formData,
        success: function (response) {
            if (response.success == true) {
                $('#addrassArea').load('/account #addrassArea');
                $('#addAddressModals').modal('hide');
                $('.modal-backdrop').remove();
            }
        },
        error: function (error) {
            console.error('Error:', error);
        }
    });

    return false;
});


  
  



