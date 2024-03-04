

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
	   
		   // Show the modal
		$('#addAddressModals').modal('show');
	   }
	   
	   $('#submitAddressBtns').on('click', function() {
		   const formData = $('#addAddressForms').serialize();
		   console.log(formData);
	   
		   $.ajax({
			   type: 'POST',
			   url: '/user/editaddresses',
			   data: formData,
			   success: function(response) {
				   if (response.success == true) {
					   $('#addrassArea').load('/user/checkout #addrassArea');
					   $('#addAddressModals').modal('hide');
					   $('.modal-backdrop').remove();
	   
				   }
			   },
			   error: function(error) {
				   console.error('Error:', error);
			   }
		   });
	   
		   return false;
	   });
	   


//add address
$(document).ready(function () {
    $('#submitAddressBtn').on('click', function () {
        if (validateForm()) {
            var formData = $('#addAddressForm').serialize();
            console.log(formData);

            $.ajax({
                type: 'POST',
                url: '/user/addaddress',
                data: formData,
                success: function (response) {
                    console.log(response);
                    if (response.add == true) {
                        // $('#addrassArea').load('/account #addrassArea');
                        $('#addrassArea').load('/user/account #addrassArea');
                        // window.location.reload();
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

	   

    $(document).ready(function () {
    $("#placeOrderBtn").on("click", function (event) {
        var formData = $("#orderForm").serialize();
        event.preventDefault();

        console.log(formData,"is getting")
        $.ajax({
            type: "POST",
            url: "/user/placeorder",
            data: formData,
            success: function (response) {
                console.log(response);
                if (response.placed == true) {
                    window.location.href = '/user/success';
                }else if(response.wallet == false){
                        swal.fire("Oops, it looks like your wallet balance is too low to place this order !!", "", "error")
                    }
				 else {
                    razorpayPayment(response.order);
                }
            },
            error: function (error) {
                console.error('Error:', error);
                alert("An error occurred while processing the order.");
            }
        });
    });
});

function razorpayPayment(order) {
    console.log(order,"tihiu");
    var options = {
        "key": "rzp_test_6nfEH21z7G2Wtu",
        "amount": order.amount,
        "currency": "INR",
        "name": "Furni.Ltd",
        "description": "Test Transaction",
        "image": "",
        "order_id": order.id,
        handler: function (response) {
            verifyPayment(response, order);
			},
			"prefill": {
				"name": "Furni Ltd",
				"email": "furniworld@gmail.com",
				"contact": "9999999999"
			},
			"notes": {
				"address": "India"
			},
			"theme": {
				"color": "#cc9967"
        }
    };

    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function verifyPayment(payment, order) {

    $.ajax({
        url: "/user/verifypayment",
        method: "post",
        data: {
            payment: payment,
            order: order,
        },
        success: (response) => {
            if (response.placed == true) {
                window.location.href = '/success'
            } else {
                swal.fire({
                    positon: "center",
                    icon: "error",
                    title: "Payment failed",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        },
    });
}


function applyCoupon() {
    const couponCodeInput = document.getElementById("couponinput"); 
    const couponCode = couponCodeInput.value;

    $.ajax({
        type: "POST",
        url: "/user/checkcoupon", 
        data: { coupon: couponCode },
        success: function(response) {
            if(response.coupon == false) {
                swal.fire("No Coupon Available", "", "error");
            } else if(response.coupon == 'notAct') {
                swal.fire("This Coupon is No Longer Available", "", "error");
            } else if(response.coupon == 'used') {
                swal.fire("This Coupon is Already Used. Try Another One", "", "error");
            } else if(response.coupon == 'amountIssue') {
                swal.fire("Purchase More to Use This Coupon", "", "error");
            } else if(response.coupon) {
                swal.fire("Success", "Coupon Added!", "success");
                $('#reloadArea').load('/user/checkout #reloadArea'); 
                $('#reloadArea2').load('/user/checkout #reloadArea2');
            } else {
                swal.fire("Something Went Wrong", "", "error");
            }
        }
    });
}


function removecoupon(){
        $.ajax({
            method: 'POST',
            url: '/user/removecoupon', 
            data: JSON.stringify(),
            contentType: 'application/json',
            success: function (response) {
                if(response.remove===true){
					swal.fire("Success", "Coupon Removed!", "success");
                    $('#reloadArea').load('/user/checkout #reloadArea');
                    $('#reloadArea2').load('/user/checkout #reloadArea2');
                }else{
                 
                }
            },
            error: function (error) {

                console.error(error);
            }
        });
    }
