const patientsList = document.querySelector('.patients-list');
const diagnosticsList = document.querySelector('.diagnostics-table');
const labList = document.querySelector('.lab-list');

const profilePictureFull = document.querySelector('.profile-picture-full');
const profileName = document.querySelector('.profile-name');

//Generate key to fetch data from API
let API_user = 'coalition';
let API_password = 'skills-test';
let auth = btoa(`${API_user}:${API_password}`);

//Variable in order to populate content depending on patient selected
let currentPatient = 3;

fetch('https://fedskillstest.coalitiontechnologies.workers.dev', {
  headers: {
    authorization: `Basic ${auth}`,
  },
})
  .then((response) => response.json())
  .then((data) => {
    //use data to run functions that will populate the different website sections
    fillPatientsList(data);
    fillDiagnosticsList(data, currentPatient);
    fillLabResults(data, currentPatient);
    fillProfile(data, currentPatient);
  })
  .catch((error) => error);

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
      li.setAttribute('class', 'active-soft patients-card');
    } else {
      li.setAttribute('class', 'patients-card');
    }
    //set all classes and attributes in each element
    img.setAttribute('class', 'profile-picture');
    img.setAttribute('src', patient.profile_picture);
    img.setAttribute('alt', 'profile picture');
    profileText.setAttribute('class', 'profile-text');
    name.setAttribute('class', 'body-emphasized-14pt');
    name.innerHTML = patient.name;

    info.setAttribute('class', 'body-secondary-info-14pt');
    info.innerHTML = `${patient.gender}, ${patient.age}`;

    icon.setAttribute('class', 'icon-3-dots icon-left');

    profileText.appendChild(name);
    profileText.appendChild(info);
    li.appendChild(img);
    li.appendChild(profileText);
    li.appendChild(icon);
    patientsList.appendChild(li);
  });
}

function fillDiagnosticsList(data, current) {
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
  profilePictureFull.setAttribute('src', `${person.profile_picture}`);
}
