const urlParams = new URLSearchParams(location.search);
const token = urlParams.get('token');

const form = document.querySelector('#withdrawForm');
const submitButton = document.querySelector('#submitButton');
const sectionInfo = document.querySelector('#sectionInfo');

if (!token) {
  sectionInfo.innerHTML = 'Authorization failure';
  form.style.display = 'none';
}

const withdrawMoney = (amount) => {
  fetch('/api/transaction/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount }),
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
  withdrawMoney(Number(form.amount.value));
};
