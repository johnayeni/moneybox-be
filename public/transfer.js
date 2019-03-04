const urlParams = new URLSearchParams(location.search);
const token = urlParams.get('token');

const form = document.querySelector('#transferForm');
const submitButton = document.querySelector('#submitButton');
const sectionInfo = document.querySelector('#sectionInfo');

if (!token) {
  sectionInfo.innerHTML = 'Authorization failure';
  form.style.display = 'none';
}

const transferMoney = (amount, receiver_matric_number) => {
  fetch('/api/transaction/transfer', {
    method: 'POST',
    body: JSON.stringify({ amount, receiver_matric_number }),
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
      alert('Something went wrong!');
    });
};

form.onsubmit = async (event) => {
  event.preventDefault();
  submitButton.setAttribute('disabled', true);
  transferMoney(Number(form.amount.value), form.receiver_matric_number.value);
};
