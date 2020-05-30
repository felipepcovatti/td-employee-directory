const htmlTag = document.querySelector('html');
const usersUrl = "https://randomuser.me/api/?results=12&nat=us&inc=picture,name,email,location,cell,dob,login";
const spinner = document.querySelector('.lds-dual-ring');
const content = document.querySelector('.content');
const table = document.querySelector('.table');
const search = document.querySelector('.search');
const overlay = document.querySelector('.overlay');
const details = overlay.querySelector('.userdetails');
const next = overlay.querySelector('.next');
const prev = overlay.querySelector('.prev');
let fullUsersArr;

// fetch functions
function okStatus(res) {
  if (res.ok) {
    return Promise.resolve(res);
  } else {
    return Promise.reject(new Error(res.statusText));
  }
}

function parseJson(response) {
  return response.json();
}

function handleUsers(users) {
  fullUsersArr = users.results;
  generateThumbs(fullUsersArr);
  showContent();
  adjustCardThumb();
}

function handleError(error) {
  console.log(error);
  content.innerHTML = `
    <h1>There was an error loading the content</h1>
    <div>
      ${error}<br>
      API URL: <a class='a-url' href='${usersUrl}' title='${usersUrl}' target='blank'>${usersUrl}
    </div>
  `;
  showContent();
}
// end

// other functions
function generateThumbs(arrayOfUsers) {
  table.innerHTML = arrayOfUsers.map((user, index) => {
    const picUrl = user.picture.large;
    const fName = user.name.first.replace(/\b\w/g, l => l.toUpperCase());
    const lName = user.name.last.replace(/\b\w/g, l => l.toUpperCase());
    const email = user.email;
    const city = user.location.city.replace(/\b\w/g, l => l.toUpperCase());
    return `
    <div data-index='${index}'>
      <img src='${picUrl}' alt='Pitcure of ${fName} ${lName}'>
      <div>
        <h1>${fName} ${lName}</h1>
        <span>${email}</span>
        <span>${city}</span>
      </div>
    </div>
    `;
  }).join('');

  if ((table.children.length - 2) % 3 === 0) {
    const div = document.createElement('DIV');
    div.className = 'hidden';
    table.appendChild(div);
  }
}

function barGap() {
  htmlTag.style.width = '100%';
  htmlTag.style.overflowY = 'scroll';
  const withBar = htmlTag.offsetWidth;
  htmlTag.style.overflowY = 'hidden';
  htmlTag.style.width = withBar + 'px';
}

function showContent() {
  spinner.style.display = 'none';
  content.style.display = 'block';
}


function adjustCardThumb() {
  const thumb = table.children[0];
  if (thumb && thumb.offsetWidth < 370) {
    table.classList.add('column');
  } else {
    table.classList.remove('column');
  }
}

function generateCard(thumb) {
  const index = thumb.dataset.index;
  const user = fullUsersArr[index];
  details.innerHTML = `
  ${thumb.innerHTML}
  <hr>
  <div>
    <span>
      ${user.cell}
    </span>
    <span>
      ${user.location.street.replace(/\b\w/g, l => l.toUpperCase())}, ${user.location.state.replace(/\b\w/g, l => l.toUpperCase())} ${user.location.postcode}
    </span>
    <span>
      Birthday: ${parseInt(user.dob.date.slice(5, 7), 10)}/${parseInt(user.dob.date.slice(8, 10), 10)}/${user.dob.date.slice(0, 4)}
    </span>
  </div>
  `;
  details.dataset.index = index;

  if (thumb.nextElementSibling && thumb.nextElementSibling.className != 'hidden') {
    next.style.display = 'block';
  } else {
    next.style.display = 'none';
  }

  if (thumb.previousElementSibling) {
    prev.style.display = 'block';
  } else {
    prev.style.display = 'none';
  }
}

function openCard(e) {
  if (e.target != table && e.target.className != 'hidden') {
    const clickedThumb = (() => {
      let ct;
      for (ct = e.target; ct.parentNode != table; ct = ct.parentNode);
      return ct;
    })();
    overlay.style.display = 'block';
    generateCard(clickedThumb);
    barGap();
    document.addEventListener('keyup', keysNav);
    window.addEventListener('resize', barGap);
  }
}

function closeCard() {
  details.innerHTML = '';
  overlay.style.display = 'none';
  htmlTag.style.overflowY = 'scroll';
  htmlTag.style.width = '100%';
  document.removeEventListener('keyup', keysNav);
  window.removeEventListener('resize', barGap);
}

function changeCard(next = true) {
  const currThumb = table.querySelector(`[data-index='${details.dataset.index}']`);
  const newThumb = next ? currThumb.nextElementSibling : currThumb.previousElementSibling;
  generateCard(newThumb);
}

function keysNav(e) {
  switch (e.keyCode) {
    case 39:
      if (next.style.display == 'block') changeCard();
      break;
    case 37:
      if (prev.style.display == 'block') changeCard(false);
      break;
    case 27:
      closeCard();
      break;
  }
}
// end

fetch(usersUrl).then(okStatus).then(parseJson).then(handleUsers).catch(handleError);


// listeners
table.addEventListener('click', openCard);

search.addEventListener('input', e => {
  const filteredUsersArr = fullUsersArr.filter(
    (user) => {
      const filter = search.value.toUpperCase();
      const name = (user.name.first + ' ' + user.name.last).toUpperCase();
      const username = user.login.username.toUpperCase();
      return name.startsWith(filter) || username.startsWith(filter);
    }
  );
  generateThumbs(filteredUsersArr);
});

overlay.addEventListener('click', (e) => {
  if (e.target.className == 'close' || e.target == overlay) {
    closeCard();
  } else if (e.target == next) {
    changeCard();
  } else if (e.target == prev) {
    changeCard(false);
  }
});

window.addEventListener('resize', () => {
  adjustCardThumb();
});
