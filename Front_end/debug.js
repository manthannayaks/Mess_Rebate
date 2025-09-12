// Debug version of the script
console.log('Debug script loaded');

const perDayRate = 140;

async function showData() {
  console.log('showData function called');
  const roll = document.getElementById("roll").value.trim();
  const resultDiv = document.getElementById("result");

  console.log('Roll number:', roll);

  if (!roll) {
    resultDiv.innerHTML = `<p style="color:red;">Please enter a roll number.</p>`;
    return;
  }

  try {
    console.log(`Fetching data for roll: ${roll}`);
    const url = `http://localhost:3001/api/students/${roll}`;
    console.log('URL:', url);
    
    const response = await fetch(url);
    console.log('Response received:', response);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      resultDiv.innerHTML = `<p style="color:red;">No data found for roll number: ${roll}</p>`;
      return;
    }

    const data = await response.json();
    console.log('Data received:', data);
    
    resultDiv.innerHTML = `
      <div class="student-info">
        <h2>Student Information</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Roll Number:</strong> ${data.rollNo}</p>
      </div>
      <div class="summary">
        <h3>Total Rebate: ₹${data.totalRebate}</h3>
        <p>Rebate rate: ₹${perDayRate} per absent day</p>
      </div>`;
  } catch (err) {
    console.error('Error:', err);
    resultDiv.innerHTML = `<p style="color:red;">Error fetching data: ${err.message}</p>`;
  }
}

// Make function global
window.showData = showData;
