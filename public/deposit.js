const urlParams = new URLSearchParams(location.search);
const email = urlParams.get('email');
const token = urlParams.get('token');

const form = document.querySelector('#depositForm');
const submitButton = document.querySelector('#submitButton');
const sectionInfo = document.querySelector('#sectionInfo');

if (!token || !email) {
  sectionInfo.innerHTML = 'Something went wrong';
  form.style.display = 'none';
}

const payWithPaystack = (amount, email) => {
  let handler = PaystackPop.setup({
    key: 'pk_test_1a977c36c0530535dce7d9510145f68c627517a1',
    email: email,
    amount: amount,
    currency: 'NGN',
    ref: `${Math.floor(Math.random() * 1000000000 + 1)}`,
    callback: function(response) {
      const { reference } = response;
      fetch('/api/transaction/deposit', {
        method: 'POST',
        body: JSON.stringify({ reference }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then(function(res) {
          return res.json();
        })
        .then(function(jsonBody) {
          sectionInfo.innerHTML = jsonBody.message;
          form.style.display = 'none';
        })
        .catch(function(err) {
          submitButton.setAttribute('disabled', false);
          alert(err.response.message || err.message || 'Something went wrong!');
        });
    },
    onClose: function() {
      console.log('window closed');
    },
  });
  handler.openIframe();
};

form.onsubmit = async (event) => {
  event.preventDefault();
  submitButton.setAttribute('disabled', true);
  payWithPaystack(Number(form.amount.value) * 100, email);
};
