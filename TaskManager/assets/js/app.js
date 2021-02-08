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
        console.log('Database ready and fields created!');

}

form.addEventListener('submit',addNewTask);

function addNewTask(){
    if(!taskInput.value){
        alert("Enter Task ");
        return;
    }

    let newTask={
        taskname:taskInput.value
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


function displayTaskList() {
    // clear the previous task list
    while (taskList.firstChild) {   taskList.removeChild(taskList.firstChild);}

    // create the object store
    let objectStore = DB.transaction('tasks').objectStore('tasks');

    objectStore.openCursor().onsuccess = function(e) {
        // assign the current cursor
        let cursor = e.target.result;

        if (cursor) {
                
            li.setAttribute('data-task-id', cursor.value.id);
            // Create text node and append it 
            li.appendChild(document.createTextNode(cursor.value.taskname));
            
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