document.addEventListener('DOMContentLoaded', () => {
    const logsContainer = document.getElementById('logs-container');
    
    // Функция для безопасного парсинга HTML
    function parseLogContent(content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content
            .replace(/&/g, '&amp;')  // Экранирование специальных символов
            .replace(/</g, '&lt;')   // Корректная обработка HTML-тегов
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');  // Сохранение переносов строк
        
        // Обработка списков с корректным созданием
        tempDiv.innerHTML = tempDiv.innerHTML.replace(
            /^-\s(.+)$/gm, 
            '<li>$1</li>'
        );

        // Обработка списков, если они не обернуты в <ul>
        tempDiv.innerHTML = tempDiv.innerHTML.replace(
            /(<li>.*<\/li>)+/g, 
            '<ul>$&</ul>'
        );

        return tempDiv.innerHTML;
    }

    // Загрузка JSON с логами
    fetch('logs.json')
        .then(response => response.json())
        .then(data => {
            // Сортировка логов по дате (от новых к старым)
            data.logs.sort((a, b) => {
                let dateA = a.date.split('-').reverse().join('-');
                let dateB = b.date.split('-').reverse().join('-');
                return new Date(dateB) - new Date(dateA);
            });

            // Рендеринг логов
            data.logs.forEach(logGroup => {
                const dateSection = document.createElement('section');
                dateSection.classList.add('log-date-group');
                
                const dateHeader = document.createElement('h2');
                dateHeader.textContent = logGroup.date;
                dateSection.appendChild(dateHeader);

                logGroup.entries.forEach(entry => {
                    const logEntry = document.createElement('div');
                    logEntry.classList.add('log-entry', entry.type.toLowerCase());
                    
                    logEntry.innerHTML = `
                        <span class="log-time">[${entry.type}] ${logGroup.date} ${entry.time}</span>
                        <div class="log-content">${parseLogContent(entry.content)}</div>
                    `;
                    
                    dateSection.appendChild(logEntry);
                });

                logsContainer.appendChild(dateSection);
            });
        })
        .catch(error => {
            console.error('Ошибка загрузки логов:', error);
            logsContainer.innerHTML = `
                <section class="log-entry error">
                    <h2>Ошибка загрузки логов</h2>
                    <p>Не удалось загрузить логи. Пожалуйста, попробуйте позже.</p>
                </section>
            `;
        });
}); 