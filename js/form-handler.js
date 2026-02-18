// Обработчик формы "Получить бесплатную оценку" для отправки на email
document.addEventListener('DOMContentLoaded', function() {
  console.log('Form handler loaded');
  
  // Ждем, пока React отрисует форму
  const initFormHandler = () => {
    // Ищем все кнопки с текстом "Получить бесплатную оценку" или "Получить оценку"
    const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent.includes('Получить бесплатную оценку') || 
      btn.textContent.includes('Получить оценку')
    );
    
    if (buttons.length > 0) {
      console.log('Found form buttons:', buttons.length);
      
      buttons.forEach(button => {
        button.addEventListener('click', async function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('Form submit clicked');
          
          // Находим родительскую форму или ближайший контейнер с полями
          const form = button.closest('form') || button.closest('div[class*="form"]') || button.closest('section');
          
          if (!form) {
            console.error('Form container not found');
            alert('Ошибка: не удалось найти форму');
            return;
          }
          
          // Собираем данные из всех input и select в контейнере
          const inputs = form.querySelectorAll('input, select, textarea');
          const formData = new FormData();
          
          inputs.forEach(input => {
            if (input.type === 'file') {
              if (input.files && input.files[0]) {
                formData.append('project_file', input.files[0]);
              }
            } else if (input.value && input.value.trim()) {
              // Определяем имя поля по placeholder или name
              const fieldName = input.name || input.placeholder || 'field';
              formData.append(fieldName, input.value);
            }
          });
          
          // Добавляем стандартные имена полей для PHP
          const nameInput = form.querySelector('input[placeholder*="имя" i], input[placeholder*="name" i]');
          const contactInput = form.querySelector('input[placeholder*="телефон" i], input[placeholder*="email" i], input[placeholder*="контакт" i]');
          const selectInput = form.querySelector('select');
          const projectInput = form.querySelector('textarea, input[placeholder*="проект" i]');
          
          if (nameInput && nameInput.value) formData.set('name', nameInput.value);
          if (contactInput && contactInput.value) formData.set('contact', contactInput.value);
          if (selectInput && selectInput.value) formData.set('complex_type', selectInput.value);
          if (projectInput && projectInput.value) formData.set('project_details', projectInput.value);
          
          console.log('Form data prepared');
          
          try {
            // Отправка на PHP скрипт
            const response = await fetch('https://auditpro.by/send-form.php', {
              method: 'POST',
              body: formData
            });
            
            console.log('Response received:', response.status);
            
            const result = await response.json();
            
            if (result.success) {
              alert('✓ ' + result.message);
              // Очищаем форму
              inputs.forEach(input => {
                if (input.type !== 'file') {
                  input.value = '';
                }
              });
            } else {
              alert('⚠ ' + result.message);
            }
          } catch (error) {
            console.error('Ошибка отправки:', error);
            alert('Произошла ошибка при отправке формы. Попробуйте позже.');
          }
        });
      });
    } else {
      console.log('Form buttons not found yet, retrying...');
      // Пробуем еще раз через 1 секунду
      setTimeout(initFormHandler, 1000);
    }
  };
  
  // Запускаем инициализацию с задержкой, чтобы React успел отрисовать
  setTimeout(initFormHandler, 2000);
});
