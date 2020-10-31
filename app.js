const form = document.querySelector('form');
const trHead = document.querySelector('#head');
const conData = document.querySelector('#data');
const nameInput = document.querySelector('#name');
const telInput = document.querySelector('#tel');
const button = document.querySelector('button');

let db

window.onload = () => {
    let request = window.indexedDB.open('contacts', 1)

    request.onerror = () => {
        console.log('Database failed to open')
    }

    request.onsuccess = () => {
        console.log('Database opened successfully')
        db = request.result;
        displayData();
    }
    request.onupgradeneeded = (e) => {
        let db = e.target.result;
        let objectStore = db.createObjectStore('contacts', { keyPath: 'id', autoIncrement:true });
    
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('telephone', 'telephone', { unique: false });
        
        console.log('Database setup complete');
      };

    form.onsubmit = (e) => {
        e.preventDefault()
        let newItem = { name: nameInput.value, telephone: telInput.value};
        let transaction = db.transaction(['contacts'], 'readwrite');
        let objectStore = transaction.objectStore('contacts');
        var request = objectStore.add(newItem)

        request.onsuccess = () => {
            nameInput.value = '';
            telInput.value = '';
    

        transaction.oncomplete = () => {
            console.log('Transaction completed: database modification finished.');
            displayData();
        };

        transaction.onerror = () => {
            console.log('Transaction not opened due to error');
        };
    }
  }

    function displayData() {
        while (conData.firstChild) {
          conData.removeChild(conData.firstChild);
        }

        let objectStore = db.transaction('contacts').objectStore('contacts');

        objectStore.openCursor().onsuccess = (e) => {
          let cursor = e.target.result;

          if(cursor) {
            let tr = document.createElement('tr');
            let tdName = document.createElement('td'); 
            let tdTel = document.createElement('td');
            

            tr.appendChild(tdName);
            tr.appendChild(tdTel);           
            conData.appendChild(tr);
    
            tdName.textContent = cursor.value.name
            tdTel.textContent = cursor.value.telephone
            
    
            tr.setAttribute('data-contact-id', cursor.value.id);
    
            let deleteBtn = document.createElement('button');
            tr.appendChild(deleteBtn);
            deleteBtn.textContent = 'Delete';
    
            deleteBtn.onclick = deleteItem;

            cursor.continue();
          } 
          else {
            if(!conData.firstChild) {
              let para = document.createElement('p');
              para.textContent = 'No contact stored.'
              conData.appendChild(para);
            }
            console.log('Notes all displayed');
          }
        };
      }

      function deleteItem(e) {
        let contactId = Number(e.target.parentNode.getAttribute('data-contact-id'));
        let transaction = db.transaction(['contacts'], 'readwrite');
        let objectStore = transaction.objectStore('contacts');
        let request = objectStore.delete(contactId);
    
        transaction.oncomplete = () => {
          e.target.parentNode.parentNode.removeChild(e.target.parentNode);
          console.log('Contact ' + contactId + ' deleted.');

          if(!conData.firstChild) {
            let para = document.createElement('p');
            para.textContent = 'No notes stored.';
            conData.appendChild(para);
          }
        };
      }
}

module.exports = displayData;
module.exports = deleteItem;