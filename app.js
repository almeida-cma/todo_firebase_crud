// Importe as funções necessárias do Firebase e do arquivo de configuração
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import firestore from './firebase-config.js';

// Referência à coleção de tarefas no Firestore
const taskCollection = collection(firestore, 'tasks');

// Função para adicionar uma nova tarefa
export async function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskName = taskInput.value.trim();

    if (taskName === '') {
        return; // Impede a adição de tarefas vazias
    }

    // Adiciona a nova tarefa à coleção no Firestore
    await addDoc(taskCollection, {
        name: taskName,
        completed: false
    });

    taskInput.value = ''; // Limpa o campo de entrada após a adição

    // Após adicionar a tarefa, chama a função para exibir as tarefas atualizadas
    displayTasks();
}

// Função para excluir uma tarefa
export async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        // Exclui a tarefa com o ID especificado
        await deleteDoc(doc(taskCollection, taskId));

        // Após excluir a tarefa, chama a função para exibir as tarefas atualizadas
        displayTasks();
    }
}

// Função para editar uma tarefa
export async function editTask(taskId, newTaskName) {
    const taskDocRef = doc(taskCollection, taskId);
    await updateDoc(taskDocRef, { name: newTaskName });

    // Após editar a tarefa, chama a função para exibir as tarefas atualizadas
    displayTasks();
}

// Função para exibir as tarefas a partir do Firestore
export function displayTasks() {
    onSnapshot(taskCollection, (snapshot) => {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = ''; // Limpa a lista antes de adicionar os novos itens

        snapshot.forEach((doc) => {
            const task = doc.data();
            const taskId = doc.id;

            // Cria um novo item de lista para cada tarefa
            const li = document.createElement('li');
            li.textContent = task.name;
            li.setAttribute('data-id', taskId);
            li.classList.add('task-item');

            // Adiciona eventos de clique para marcar a tarefa como concluída ou editar/excluir
            li.addEventListener('click', async () => {
                await updateTaskCompletion(taskId, !task.completed);
            });

            // Cria botões para editar e excluir a tarefa
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-button');
            editButton.addEventListener('click', (event) => {
                event.stopPropagation();
                openEditModal(taskId, task.name);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteTask(taskId);
            });

            li.appendChild(editButton);
            li.appendChild(deleteButton);

            // Adiciona a classe 'completed' se a tarefa estiver marcada como concluída
            if (task.completed) {
                li.classList.add('completed');
            }

            // Adiciona o item de lista à lista de tarefas
            taskList.appendChild(li);
        });
    });
}

// Função para abrir um modal de edição de tarefa
function openEditModal(taskId, currentTaskName) {
    const newTaskName = prompt('Edit task name:', currentTaskName);
    if (newTaskName !== null) {
        editTask(taskId, newTaskName);
    }
}

// Função para atualizar o status de conclusão de uma tarefa
async function updateTaskCompletion(taskId, completed) {
    const taskDocRef = doc(taskCollection, taskId);
    await updateDoc(taskDocRef, { completed: completed });
}

// Chama a função displayTasks() ao carregar o conteúdo da página
document.addEventListener('DOMContentLoaded', () => {
    displayTasks();
});

// Exporta a função addTask para ser acessível no escopo global (usada no HTML)
window.addTask = addTask;
