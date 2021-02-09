// Define UI Variables 
const taskInput = document.querySelector('#task'); //the task input text field
const form = document.querySelector('#task-form'); //The form at the top
const filter = document.querySelector('#filter'); //the task filter text field
const taskList = document.querySelector('.collection'); //The UL
const clearBtn = document.querySelector('.clear-tasks'); //the all task clear button

const reloadIcon = document.querySelector('.fa'); //the reload button at the top navigation 

// Add Event Listener  [Form , clearBtn and filter search input ]


//Db var

let DB;
document.addEventListener('DOMContentLoaded',()=>{
    //creating DB
    let TaskDB=indexedDB.open("tasks",1);

    TaskDB.onsuccess=function(){
        console.log("Databade is ready !!!");

        DB=TaskDB.result;

        // displayTaskList();
    }

    TaskDB.onerror=function(){
        console.log("There was error");
    }

    TaskDB.onupgradeneeded=function(e){
        let db = e.target.result;
        let objectStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('taskname', 'taskname', { unique: false });
        objectStore.createIndex('date', 'date', { unique: false });
        console.log('Database ready and fields created!');

}

form.addEventListener('submit',addNewTask);

function addNewTask(e){
    e.preventDefault();


    if(!taskInput.value){
        alert("Enter Task ");
        return;
    }

    let newTask={
        taskname:taskInput.value,
        date:new Date().getTime(),
    }

    let transaction = DB.transaction(['tasks'], 'readwrite');
    let objectStore = transaction.objectStore('tasks');

    let request = objectStore.add(newTask);
        // on success
    request.onsuccess = () => {
        form.reset();
    }
    transaction.oncomplete = () => {
        console.log('New appointment added');
        displayTaskList();
    }
    transaction.onerror = () => { console.log('There was an error, try again!'); }


}

sort.addEventListener('change', displayTaskList)
function displayTaskList() {
    // clear the previous task list
    while (taskList.firstChild) {
        taskList.removeChild(taskList.firstChild);
    }

    // create the object store
    let objectStore = DB.transaction('tasks').objectStore('tasks');
    let sort_value = ''

    if (sort.value == '1') {
        sort_value = "next"
    } else {
        sort_value = "prev"
    }
    let index = objectStore.index("date");
    index.openCursor(null, sort_value).onsuccess = function(e) {
        // assign the current cursor
        let cursor = e.target.result;

        if (cursor) {

            // Create an li element when the user adds a task 
            const li = document.createElement('li');
            //add Attribute for delete 
            li.setAttribute('data-task-id', cursor.value.id);
            // Adding a class
            li.className = 'collection-item';
            // Create text node and append it 
            li.appendChild(document.createTextNode(cursor.value.taskname));
            // Create new element for the link 
            const link = document.createElement('a');
            // Add class and the x marker for a 
            link.className = 'delete-item secondary-content';
            link.innerHTML = `
             <i class="fa fa-remove"></i>
            &nbsp;
            <a href="./edit.html?id=${cursor.value.id}"><i class="fa fa-edit"></i> </a>
            `;
            li.dataset.date = cursor.value.date;
            // Append link to li
            li.appendChild(link);
            // Append to UL 
            taskList.appendChild(li);
            cursor.continue();
        }
    }
}

//clear button event listener    
clearBtn.addEventListener('click', clearAllTasks);
    //clear tasks 
    function clearAllTasks() {
        //Create the transaction and object store
        let transaction = DB.transaction("tasks", "readwrite"); 
        let tasks = transaction.objectStore("tasks");

        // clear the the table
        tasks.clear(); 
        //repaint the UI
        displayTaskList();

        console.log("Tasks Cleared !!!");
    }

  // Remove task event [event delegation]
  taskList.addEventListener('click', removeTask);

  function removeTask(e) {

      if (e.target.parentElement.classList.contains('delete-item')) {
          if (confirm('Are You Sure about that ?')) {
              // get the task id
              let taskID = Number(e.target.parentElement.parentElement.getAttribute('data-task-id'));
              // use a transaction
              let transaction = DB.transaction(['tasks'], 'readwrite');
              let objectStore = transaction.objectStore('tasks');
              objectStore.delete(taskID);

              transaction.oncomplete = () => {
                  e.target.parentElement.parentElement.remove();
              }

          }
      }
  }


    
});