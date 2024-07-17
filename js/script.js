const patientsList = document.querySelector('.patients-list');
//patients card variable will be populated once the patient list renders
let patientsCard;
const diagnosticsList = document.querySelector('.diagnostics-table');
const labList = document.querySelector('.lab-list');
const profilePictureFull = document.querySelector('.profile-picture-full');
const profileName = document.querySelector('.profile-name');
const dateBirth = document.querySelector('#date-of-birth');
const iconGender = document.querySelector('#icon-gender');
const gender = document.querySelector('#gender');
const contactInfo = document.querySelector('#contact-info');
const emergencyContact = document.querySelector('#emergency-contact');
const insuranceProvider = document.querySelector('#insurance-provider');
const dropdown = document.querySelector('.dropdown-menu');
const dropdownUL = document.querySelector('.dropdown-list');
const dropdownList = document.querySelectorAll('.dropdown-list li');
const dropdownCurrent = document.getElementById('dropdown-current');

const chart = document.querySelector('#chart').getContext('2d');
//Generate key to fetch data from API
let API_user = 'coalition';
let API_password = 'skills-test';
let auth = btoa(`${API_user}:${API_password}`);

//Variable in order to populate content depending on patient selected
let currentPatient = 3;
let apiData = '';
let myChart;
fetch('https://fedskillstest.coalitiontechnologies.workers.dev', {
  headers: {
    authorization: `Basic ${auth}`,
  },
})
  .then((response) => response.json())
  .then((data) => {
    //use data to run functions that will populate the different website sections
    apiData = data;
    fillPatientsList(data);
    fillDiagnosticsList(data, currentPatient);
    fillLabResults(data, currentPatient);
    fillProfile(data, currentPatient);
    //Default months to show on pageload are 6
    graphData(6);
    fillGraph();
  })
  .catch((error) => error);

function updateCurrentPatient() {
  //Clear the data from the old patient
  diagnosticsList.replaceChildren(diagnosticsList.firstElementChild);
  labList.replaceChildren();

  //Run functions to populate data again
  fillDiagnosticsList(apiData, currentPatient);
  fillLabResults(apiData, currentPatient);
  fillProfile(apiData, currentPatient);
  //Default months to show on pageload are 6
  graphData(6);
  fillGraph();
}

//Fill out the section with data from patients.
function fillPatientsList(data) {
  data.map((patient, index) => {
    //create all the elements needed to make a profile in the list with picture, name, secondary info, and icon.
    const li = document.createElement('li');
    const img = document.createElement('img');
    const profileText = document.createElement('div');
    const name = document.createElement('span');
    const info = document.createElement('span');
    const icon = document.createElement('i');

    //Check the active patient and change background color
    if (index === currentPatient) {
      li.classList.add('patients-card', 'active-soft');
    } else {
      li.classList.add('patients-card');
    }
    //set all classes and attributes in each element
    img.classList.add('profile-picture');
    img.setAttribute('src', patient.profile_picture);
    img.setAttribute('alt', 'profile picture');
    profileText.classList.add('profile-text');
    name.classList.add('body-emphasized-14pt');
    name.textContent = patient.name;

    info.classList.add('body-secondary-info-14pt');
    info.textContent = `${patient.gender}, ${patient.age}`;

    icon.classList.add('icon-3-dots', 'icon-left');

    profileText.appendChild(name);
    profileText.appendChild(info);
    li.appendChild(img);
    li.appendChild(profileText);
    li.appendChild(icon);
    patientsList.appendChild(li);
  });
  //update list of patients in a global variable
  patientsCard = [...document.querySelectorAll('.patients-card')];
  handlePatientChange();
}

let bloodPressureDataSys = [];
let bloodPressureDataDia = [];
let chartLabels = [];

function graphData(months) {
  //Reset current data to 0
  bloodPressureDataDia = [];
  bloodPressureDataSys = [];
  chartLabels = [];
  const history = apiData[currentPatient].diagnosis_history;
  for (let i = 0; i < months; i++) {
    bloodPressureDataSys.unshift(history[i].blood_pressure.systolic.value);
    bloodPressureDataDia.unshift(history[i].blood_pressure.diastolic.value);
    chartLabels.unshift(`${history[i].month.slice(0, 3)}, ${history[i].year}`);
  }

  //Update chart datasets
  if (myChart) {
    myChart.data.labels = chartLabels;
    myChart.data.datasets[0].data = bloodPressureDataSys;
    myChart.data.datasets[1].data = bloodPressureDataDia;
    myChart.update();
  }
}

function fillGraph() {
  //target all elements that will be populated with the API data in graph section
  const currentSys = document.getElementById('systolic');
  const currentDia = document.getElementById('diastolic');
  const currentRes = document.getElementById('respiratory-rate');
  const currentTemp = document.getElementById('temperature');
  const currentHea = document.getElementById('heart-rate');
  const avgSys = document.getElementById('average-sys');
  const avgDia = document.getElementById('average-dia');
  const avgRes = document.getElementById('average-res');
  const avgTemp = document.getElementById('average-temp');
  const avgHea = document.getElementById('average-hea');
  const avgIcon = document.querySelectorAll('.avg-icon');

  //Get data, default period of time for the graph is 6 months.
  const lastResult = apiData[currentPatient].diagnosis_history[0];

  currentDia.textContent = lastResult.blood_pressure.diastolic.value;
  currentSys.textContent = lastResult.blood_pressure.systolic.value;
  currentRes.textContent = `${lastResult.respiratory_rate.value} bpm`;
  currentTemp.textContent = `${lastResult.temperature.value}°F`;
  currentHea.textContent = `${lastResult.heart_rate.value} bpm`;
  avgDia.textContent = lastResult.blood_pressure.diastolic.levels;
  avgSys.textContent = lastResult.blood_pressure.systolic.levels;
  avgRes.textContent = lastResult.respiratory_rate.levels;
  avgTemp.textContent = lastResult.temperature.levels;
  avgHea.textContent = lastResult.heart_rate.levels;
  //create an icon according to lower or higher averages
  avgIcon.forEach((line) => {
    if (line.querySelector('span').textContent.includes('Lower')) {
      line.querySelector('i').classList.add('icon-arrowdown');
      line.querySelector('i').style.display = 'inline-block';
    } else if (line.querySelector('span').textContent.includes('Higher')) {
      line.querySelector('i').classList.add('icon-arrowup');
      line.querySelector('i').style.display = 'inline-block';
    } else {
      line.querySelector('i').style.display = 'none';
    }
  });

  //Create the chart if it doesnt exist yet.
  //Reuse this function to update the legend if we are checking a different patient.
  if (!myChart) {
    myChart = new Chart(chart, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: 'systolic',
            data: bloodPressureDataSys,
            tension: 0.4,
            borderColor: '#E66FD2',
            pointRadius: 8,
            pointBackgroundColor: '#E66FD2',
          },
          {
            label: 'diastolic',
            data: bloodPressureDataDia,
            tension: 0.4,
            borderColor: '#8C6FE6',
            pointRadius: 8,
            pointBackgroundColor: '#8C6FE6',
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#072635',
            },
            grid: {
              display: false,
            },
          },
          y: {
            ticks: {
              color: '#072635',
            },
          },
        },
      },
    });
  }
}

function fillDiagnosticsList(data, current) {
  //Clear data in case this function ran before

  data[current].diagnostic_list.map((person) => {
    const name = document.createElement('div');
    const description = document.createElement('div');
    const status = document.createElement('div');
    const row = document.createElement('div');

    row.setAttribute('class', 'table-row');
    name.setAttribute('class', 'table-col-1');
    description.setAttribute('class', 'table-col-2');
    status.setAttribute('class', 'table-col-3');

    name.innerHTML = `${person.name}`;
    description.innerHTML = `${person.description}`;
    status.innerHTML = `${person.status}`;
    row.appendChild(name);
    row.appendChild(description);
    row.appendChild(status);

    diagnosticsList.appendChild(row);
  });
}
function fillLabResults(data, current) {
  data[current].lab_results.map((result) => {
    const li = document.createElement('li');
    li.innerHTML = `${result} <i class="icon-download"></i>`;
    labList.append(li);
  });
}

function fillProfile(data, current) {
  const person = data[current];
  profileName.innerHTML = person.name;

  dateBirth.innerHTML = person.date_of_birth;
  //Use the correct gender icon for the current person
  if (person.gender === 'Female') {
    iconGender.setAttribute('class', 'icon-femaleicon');
  } else {
    iconGender.setAttribute('class', 'icon-maleicon');
  }
  gender.innerHTML = person.gender;
  contactInfo.innerHTML = person.phone_number;
  emergencyContact.innerHTML = person.emergency_contact;
  insuranceProvider.innerHTML = person.insurance_type;

  // We are not using the profile picture from the API because of the low resolution.
  // Instead we will use the asset provided with a proper 200px size.
  if (currentPatient === 3) {
    profilePictureFull.setAttribute(
      'src',
      'assets/profile-pictures/big-profile-pic.png'
    );
  } else {
    profilePictureFull.setAttribute('src', `${person.profile_picture}`);
  }
}

dropdown.addEventListener('mouseover', () => {
  dropdownUL.classList.add('hover');
});

dropdown.addEventListener('mouseout', () => {
  dropdownUL.classList.remove('hover');
});

function handlePatientChange() {
  patientsCard.forEach((patient) => {
    patient.addEventListener('click', (e) => {
      currentPatient = patientsCard.indexOf(e.currentTarget);
      patientsCard.forEach((li) => {
        if (li.classList.value.includes('active-soft')) {
          li.classList.remove('active-soft');
        }
      });
      e.currentTarget.classList.add('active-soft');
      updateCurrentPatient();
    });
  });
}
