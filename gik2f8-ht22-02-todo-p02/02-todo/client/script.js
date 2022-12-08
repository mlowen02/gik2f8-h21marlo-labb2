todoForm.title.addEventListener('keyup', (e) => validateField(e.target));
todoForm.title.addEventListener('blur', (e) => validateField(e.target));
todoForm.description.addEventListener('input', (e) => validateField(e.target));
todoForm.description.addEventListener('blur', (e) => validateField(e.target));
todoForm.dueDate.addEventListener('input', (e) => validateField(e.target));
todoForm.dueDate.addEventListener('blur', (e) => validateField(e.target));

todoForm.addEventListener('submit', onSubmit);

const todoListElement = document.getElementById('todoList');

let titleValid = true;
let descriptionValid = true;
let dueDateValid = true;

const api = new Api('http://localhost:5000/tasks');

function validateField(field) {
  const { name, value } = field;

  let = validationMessage = '';

  switch (name) {
    case 'title': {
      if (value.length < 2) {
        titleValid = false;
        validationMessage = "Fältet 'Titel' måste innehålla minst 2 tecken.";
      } else if (value.length > 100) {
        titleValid = false;
        validationMessage = "Fältet 'Titel' får inte innehålla mer än 100 tecken.";
      } else {
        titleValid = true;
      }
      break;
    }
    case 'description': {
      if (value.length > 500) {
        descriptionValid = false;
        validationMessage = "Fältet 'Beskrvining' får inte innehålla mer än 500 tecken.";
      } else {
        descriptionValid = true;
      }
      break;
    }
    case 'dueDate': {
      if (value.length === 0) {
        descriptionValid = false;
        validationMessage = "Fältet 'Slutförd senast' är obligatorisk.";
      } else {
        dueDateValid = true;
      }
      break;
    }
  }

  field.previousElementSibling.innerText = validationMessage;
  field.previousElementSibling.classList.remove('hidden');
}

function onSubmit(e) {
  e.preventDefault();
  if (titleValid && descriptionValid && dueDateValid) {
    console.log('Submit');
    saveTask();
  }
}

function saveTask() {
  const task = {
    title: todoForm.title.value,
    description: todoForm.description.value,
    dueDate: todoForm.dueDate.value,
    completed: false
  };

  api.create(task).then((task) => {
    if (task) {
      renderList();
    }
  });
}

function renderList() {
  console.log('rendering');
  api.getAll().then((tasks) => {
    todoListElement.innerHTML = '';
    if (tasks && tasks.length > 0) {
      //sortera först efter klar eller ej, sedan datum
      const completedTasks = tasks.filter(task => task.completed == true);
      const notCompletedTasks = tasks.filter(task => task.completed != true);
      const orderedCTasks = completedTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      const orderedNTasks = notCompletedTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      const finalList = [...orderedNTasks, ...orderedCTasks];
      finalList.forEach((task) => {
        todoListElement.insertAdjacentHTML('beforeend', renderTask(task));
      });
    }
  });
}

function renderTask({ id, title, description, dueDate, completed}) {
  let html = `
    <li style ="display: flex; flex-direction: row;`;
    //mer genomskinlig om uppgift klar
    completed && (html += `opacity: .35;`);
    html+= `" class="select-none mt-2 py-2 border-b border-amber-300">
      <input onclick="toggleCompleted(event, ${id})" style="width: 1.5rem; margin-right: 1rem;" type="checkbox" id="checkbox${id}" name="checkbox${id}" 
      `;
      //checkad ruta om uppgift klar
      completed && (html+= `checked`);
      html+=`>
      <div>
        <div class="flex items-center">
          <h3 style="margin-right: 1rem;" class="mb-3 flex-1 text-xl font-bold text-pink-800 uppercase">${title}</h3>
          <div>
            <span>${dueDate}</span>
            <button onclick="deleteTask(${id})" class="inline-block bg-amber-500 text-xs text-amber-900 border border-white px-3 py-1 rounded-md ml-2">Ta bort</button>
          </div>
        </div>`;
  description &&
    (html += `
        <p class="ml-8 mt-2 text-xs italic">${description}</p>
      </div>
  `);
  html += `
    </li>`;

  return html;
}

function deleteTask(id) {
  api.remove(id).then((result) => {
    renderList();
  });
}

function toggleCompleted(e, id){
  //basera på checkad ruta
  const taskCompleted = e.target.checked;
  const task = {
    completed: taskCompleted
  };
  //uppdatera och visualisera
  api.update(id, task).then(data => renderList());
}

renderList();
