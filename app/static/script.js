const taskTitleInput = document.getElementById('task-title-input')
const taskDescInput = document.getElementById('task-desc-input')
const addTaskBtn = document.getElementById('add-task-btn')
const tasksList = document.getElementById('tasks-list')

// Modal Elements
const viewTaskModalElement = document.getElementById('viewTaskModal')
const editTaskModalElement = document.getElementById('editTaskModal')
const deleteConfirmModalElement = document.getElementById('deleteConfirmModal')

// Modal BS Instances (initialize later)
let viewTaskModal, editTaskModal, deleteConfirmModal

// Modal Content Elements
const viewTaskTitle = document.getElementById('viewTaskTitle')
const viewTaskDescription = document.getElementById('viewTaskDescription')
const viewTaskDate = document.getElementById('viewTaskDate')
const editTaskIdInput = document.getElementById('edit-task-id')
const editTaskTitleInput = document.getElementById('edit-task-title')
const editTaskDescriptionInput = document.getElementById(
  'edit-task-description'
)
const saveEditBtn = document.getElementById('save-edit-btn')
const deleteTaskIdInput = document.getElementById('delete-task-id')
const confirmDeleteBtn = document.getElementById('confirm-delete-btn')

const TASKS_STORAGE_KEY = 'warrantyTasks_v2'
const loader = document.getElementById('loader')

function formatTaskDate(timestamp) {
  if (!timestamp) return ''
  try {
    const date = new Date(timestamp)
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (e) {
    console.error('Error formatting date:', e)
    return 'Неверная дата'
  }
}

function showLoader() {
  loader.classList.remove('d-none')
}

function hideLoader() {
  loader.classList.add('d-none')
}

async function getTasks() {
  try {
    showLoader()
    const response = await fetch('/api/tasks')
    if (!response.ok) throw new Error('Ошибка получения задач')
    const data = await response.json()
    return data.tasks
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return []
  } finally {
    hideLoader()
  }
}

async function saveTasks(tasks) {
  // Эта функция больше не нужна, так как мы сохраняем через API
}

function createTaskElement(task) {
  const colDiv = document.createElement('div')
  colDiv.classList.add('col')

  const taskCard = document.createElement('div')
  taskCard.classList.add('card', 'h-100', 'task')
  taskCard.dataset.id = task.id

  const cardBody = document.createElement('div')
  cardBody.classList.add('card-body')
  cardBody.style.cursor = 'pointer'
  cardBody.addEventListener('click', () => showViewModal(task))

  const title = document.createElement('h5')
  title.classList.add('card-title', 'task-title')
  title.textContent = task.title
  title.title = task.title

  const description = document.createElement('p')
  description.classList.add('card-text', 'task-description')
  description.textContent = task.content

  const dateSpan = document.createElement('small')
  dateSpan.classList.add('text-muted', 'd-block', 'mt-2', 'task-date')
  dateSpan.textContent = `Создано: ${formatTaskDate(task.created_at)}`

  cardBody.appendChild(title)
  cardBody.appendChild(description)
  cardBody.appendChild(dateSpan)

  const cardFooter = document.createElement('div')
  cardFooter.classList.add('card-footer', 'task-actions')

  const viewButton = document.createElement('button')
  viewButton.classList.add('btn', 'btn-sm', 'btn-info', 'view-btn')
  viewButton.innerHTML = '<i class="bi bi-eye"></i>'
  viewButton.title = 'Просмотр'
  viewButton.addEventListener('click', () => showViewModal(task))

  const editButton = document.createElement('button')
  editButton.classList.add('btn', 'btn-sm', 'btn-warning', 'edit-btn')
  editButton.innerHTML = '<i class="bi bi-pencil"></i>'
  editButton.title = 'Редактировать'
  editButton.addEventListener('click', () => showEditModal(task))

  const deleteButton = document.createElement('button')
  deleteButton.classList.add('btn', 'btn-sm', 'btn-danger', 'delete-btn')
  deleteButton.innerHTML = '<i class="bi bi-trash"></i>'
  deleteButton.title = 'Удалить'
  deleteButton.addEventListener('click', () => showDeleteModal(task.id))

  cardFooter.appendChild(viewButton)
  cardFooter.appendChild(editButton)
  cardFooter.appendChild(deleteButton)

  taskCard.appendChild(cardBody)
  taskCard.appendChild(cardFooter)

  colDiv.appendChild(taskCard)

  return colDiv
}

async function renderTasks() {
  const tasks = await getTasks()
  tasksList.innerHTML = ''
  if (tasks.length === 0) {
    const emptyMsg = document.createElement('p')
    emptyMsg.classList.add('empty-tasks-message')
    emptyMsg.textContent = 'Задач пока нет. Добавьте первую!'
    tasksList.appendChild(emptyMsg)
  } else {
    tasks.forEach((task) => {
      const taskElement = createTaskElement(task)
      tasksList.appendChild(taskElement)
    })
  }
}

function showViewModal(task) {
  viewTaskTitle.textContent = task.title
  viewTaskDescription.textContent = task.content
  viewTaskDate.textContent = `Создано: ${formatTaskDate(task.created_at)}`
  viewTaskModal.show()
}

function showEditModal(task) {
  editTaskIdInput.value = task.id
  editTaskTitleInput.value = task.title
  editTaskDescriptionInput.value = task.content
  editTaskModal.show()
}

function showDeleteModal(taskId) {
  deleteTaskIdInput.value = taskId
  deleteConfirmModal.show()
}

async function handleSaveTaskChanges() {
  const id = editTaskIdInput.value
  const newTitle = editTaskTitleInput.value.trim()
  const newDescription = editTaskDescriptionInput.value.trim()

  if (!newTitle) {
    alert('Заголовок не может быть пустым.')
    editTaskTitleInput.focus()
    return
  }

  try {
    showLoader()
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: newTitle,
        content: newDescription,
      }),
    })

    if (!response.ok) throw new Error('Ошибка обновления задачи')

    await renderTasks()
    editTaskModal.hide()
  } catch (error) {
    console.error('Error updating task:', error)
    alert('Ошибка при обновлении задачи')
    editTaskModal.hide()
  } finally {
    hideLoader()
  }
}

async function handleConfirmDelete() {
  const id = deleteTaskIdInput.value
  try {
    showLoader()
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) throw new Error('Ошибка удаления задачи')

    await renderTasks()
    deleteConfirmModal.hide()
  } catch (error) {
    console.error('Error deleting task:', error)
    alert('Ошибка при удалении задачи')
    deleteConfirmModal.hide()
  } finally {
    hideLoader()
  }
}

async function addTask() {
  const title = taskTitleInput.value.trim()
  const description = taskDescInput.value.trim()

  if (title) {
    try {
      showLoader()
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          content: description,
        }),
      })

      if (!response.ok) throw new Error('Ошибка добавления задачи')

      taskTitleInput.value = ''
      taskDescInput.value = ''
      await renderTasks()
    } catch (error) {
      console.error('Error adding task:', error)
      alert('Ошибка при добавлении задачи')
    } finally {
      hideLoader()
    }
  } else {
    alert('Пожалуйста, введите заголовок задачи.')
    taskTitleInput.focus()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof bootstrap === 'undefined') {
    console.error('Bootstrap Bundle not loaded!')
    return
  }
  viewTaskModal = new bootstrap.Modal(viewTaskModalElement)
  editTaskModal = new bootstrap.Modal(editTaskModalElement)
  deleteConfirmModal = new bootstrap.Modal(deleteConfirmModalElement)

  renderTasks()
})

addTaskBtn.addEventListener('click', addTask)
saveEditBtn.addEventListener('click', handleSaveTaskChanges)
confirmDeleteBtn.addEventListener('click', handleConfirmDelete)

// Добавляем обработчик для кнопки выхода
document
  .querySelector('a[href="/api/logout"]')
  .addEventListener('click', (e) => {
    e.preventDefault()
    showLoader()
    window.location.href = '/api/logout'
  })