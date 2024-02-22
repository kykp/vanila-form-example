// Большая форма заказа
const errorMessages = {
	requiredField: 'Данное поле обязательно для заполнения',
	minPhone: 'Телефон должен содержать 11 цифр'
}
/**
 * Обьект по полям которого проводиться валидация
 */
const requiredFields = {
	date: 'Дата начала',
	time: 'Время начала',
	addressFrom: 'Откуда перевозим',
	addressTo: 'Куда перевозим',
	name: 'Ваше имя',
	tel: 'Телефон',
	agreement: 'Согласие на обработку данных'
};

/**
 * Обьект с данными формы
 */
let valuesForm = {
	date: '',
	time: '',
	addressFrom: '',
	addressTo: '',
	name: '',
	tel: '',
	hours: 0,
	people: 0,
	machines: 0,
	comment: '',
	lift: false,
	agreement: false,
};

/**
 * Ошибки
 */
let formErrors = {};

const servicesPrice = {
	people: 350,
	machines: 500,
	hours: 350,
}

const servicesDisocunt = {
	lift: 100,
}
/**
 * Ждем начала загрузки ДОМ и выполняем скрипты
 */
document.addEventListener('DOMContentLoaded', () => {
	dateInput.addEventListener('click', openDatePicker)
	const orderForm = document.querySelector('#orderForm');
	const submitButton = document.querySelector('#orderFormButton');

	//если есть форма и кнопка сабмиты тогда разрешаем нажатие на кнопку
	if(orderForm && submitButton ) {
		submitButton.addEventListener('click', handleSubmit);
		//Получаем данные в форму
		getFormData();
		//подключаем маску для поля телефона
		makePhonMask();
	}

	initialModalFastForm();
	initModalConsultForm()
});


/**
 * Функция отправки формы
 * @param {*} event
 */
function handleSubmit(event) {
	event.preventDefault();
	checkRequiredFormField();

	if(Object.keys(formErrors).length >= 1) {
		console.log('Форма не отправлена есть не заполненые обязательные поля')
		return;
	}

	onFormSubmit(valuesForm)
}

/**
 * Функция обработки данных формы
 */
function getFormData () {
	//Подключаем обработку и запись в valuesForm данных при нажатии на кнопки (количество людей, машин, времени в часах);
	buttonsCounterClick();
	//Подключаем обработку ввода даты
	getInputDatePicker();
	//Подключаем обработку ввода времени
	getIputTimePicker();
	//Подключаем обработку чекбокса согласния на обработку перс данных
	getCheckBoxAgreement();
	//Подключаем обработку чекбоска лифта
	getCheckBoxLift()
	//Обработка телефона, имени, коментариев
	getInputsData();
	//Обработка адресов
	getAdressesData()
}

/**
 * поля и правила валидации
 */
const validationRules = {
	time: {
			validate: (value) => {
					const clearedValue = removeNonNumericCharacters(value);
					return clearedValue.length >= 4;
			},
			errorMessage: errorMessages.requiredField
	},
	tel: {
			validate: (value) => {
					return value.length >= 18;
			},
			errorMessage: errorMessages.requiredField
	},
	agreement: {
			validate: (value) => {
					return !!value;
			},
			errorMessage: errorMessages.requiredField
	},
	name: {
			validate: (value) => {
					return !!value.trim();
			},
			errorMessage: errorMessages.requiredField
	},
	addressFrom: {
		validate: (value) => {
				return !!value.trim();
		},
		errorMessage: errorMessages.requiredField
	},
	addressTo: {
		validate: (value) => {
				return !!value.trim();
		},
		errorMessage: errorMessages.requiredField
	},
	date: {
		validate: (value) => {
			return !!value.trim();
	},
	errorMessage: errorMessages.requiredField
	}
};


/**
 * функция отрпавки формы
 * @param {*} formValues
 */
async function onFormSubmit  (formValues) {
	const data = parseFormDataToServer(formValues);

	try {
		const response = await fetch('https://primchim.ru/api/order/createFast/', {
			method: 'POST',
			headers: {
					'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})

		const responseData = await response.json();
		const orderId= responseData.orderId;

		if(orderId) {
			window.location.href = `https://primchim.ru/order-accepted/?orderId=${orderId}`;
		}


	} catch (e) {
		console.log('ошибка отправки формы', e)
	}

}

/**
 *  форматирование даты для бека
 * @param {*} data
 * @returns
 */
function parseFormDataToServer (data) {
	return {
		...data,
		id: 1176,
		date: `${data.date} ${data.time}`,
		phone: removeNonNumericCharacters(data.tel),
		address: data.addressTo,
	}
}
/**
 * Расчет скидки
 */
function calculateDiscount(totalPrice) {
	if (valuesForm.lift) {
			return 100; // Скидка 100 рублей, если установлен лифт
	} else {
			return 0; // В противном случае скидка отсутствует
	}
}

/**
 * Расчет стоимости заказа
 */
function calculateOrderCost () {
	let totalPrice = 0;

	// Проверяем, есть ли какие-либо услуги в заказе
			const anyServiceSelected = valuesForm.hours !== 0 || valuesForm.people !== 0 || valuesForm.machines !== 0;
		// Если нет выбранных услуг, общая стоимость равна 0
			if (!anyServiceSelected) {
				totalPrice = 0;
			} else {
				const totalCars = valuesForm.machines * servicesPrice.machines;
				const totalPeople = valuesForm.people * servicesPrice.people;
				totalPrice += (totalCars + totalPeople) * valuesForm.hours;

			// Вычисляем скидку
			const discount = calculateDiscount(totalPrice);
			// Применяем скидку к общей стоимости
			totalPrice -= discount;
		}
		setTotalAmount(totalPrice.toFixed(2))
}

/**
 * Функция обработки чекбокса с лифтом
 */
function getCheckBoxLift() {
	const liftCheckbox = document.getElementById('orderFormLift');
	liftCheckbox.addEventListener('input', (e) => {
			const inputName = e.currentTarget.name;
			const value = e.currentTarget.checked;
			valuesForm[inputName] = value;
			if (inputName in requiredFields) {
					checkValidationOnChange(inputName, value);
			}
			// Вызываем функцию пересчета стоимости заказа при изменении чекбокса наличия лифта
			calculateOrderCost();
	});
}
/**
 * Установка значения в поле с ценой
 */
function setTotalAmount (totalPrice) {
	const summField = document.querySelector('#orderFormTotal');
	summField.textContent = totalPrice;
}
/**
 * Отслеживание валидации on line
 */
function checkValidationOnChange(field, value) {
	const rule = validationRules[field];
	if (!rule) return; // Проверка, что существует правило валидации для данного поля

	if (!rule.validate(value)) {
			setInvalidInput(field, rule.errorMessage);
			setError(field);
	} else {
			setValidInput(field);
			clearError(field);
	}
}
/**
 * функция удаление всех символов кроме цифр
 * @param {*} str - строка
 * @returns
 */
function removeNonNumericCharacters(str) {
	return str.replace(/\D/g, '');
}
/**
 * Функция валидации при клике на он сабмит
 */
function checkRequiredFormField () {
	for (const field in formErrors) {
		clearError(field);
}

for (const field in requiredFields) {
		if (!valuesForm[field]) {
				setInvalidInput(field, errorMessages.requiredField);
				setError(field);
				formErrors[field] = errorMessages.requiredField;
		} else {
				setValidInput(field);
		}
}
}
/**
 *  удаляем ошибку из поля
 * @param {e} field - поле
 */
function clearError (field) {
	delete 	formErrors[field];
}
/**
 * устанавливаем ошибку
 * @param {e} field  - поле ошибки
 */
function setError (field) {
	formErrors[field] = 'Ошибка валидации';
}
/**
 * Функция получени и записи данные в обьект valuesForm - времени
 */
function getIputTimePicker () {
	$("#orderFormTime").on("keyup", function() {
    const timeValue = $(this).val();
		valuesForm['time'] = timeValue
		checkValidationOnChange('time', timeValue);
});
}
/**
 * Функция получения и записи данных в обьект valuesForm - даты
 */
function getInputDatePicker () {
	$('#orderFormDate').change(function() {
    const selectedDate = $(this).val();
		valuesForm['date'] = selectedDate;
		checkValidationOnChange('date', selectedDate);
});
}
/**
 * Функция отслеживания и записи чекбокса на согласие обработки персональных данных
 */
function getCheckBoxAgreement () {
	const getCheckBoxAgreement = document.getElementById('orderFormAgreement');
	getCheckBoxAgreement.addEventListener('input', (e)=> {
		const inputName = e.currentTarget.name;
		const value = e.currentTarget.checked;
		valuesForm[inputName] = value;
		if(inputName in requiredFields){
			checkValidationOnChange(inputName, value);
		}
	})
}

/**
 * запись в форму и валидация стандартных Текстовых инпутов
 * @param {*} e
 */
function setDefaultInputData (e) {
	const inputName = e.currentTarget.name;
	const value = e.currentTarget.value;
	valuesForm[inputName] = value;

	if(inputName in requiredFields){
		checkValidationOnChange(inputName, value);
	}
}


/**
 * получение данных из полей адресов
 */
function getAdressesData () {
		const fromAdress = document.getElementById('orderFormAddressFrom');
		const toAdress = document.getElementById('orderFormAddressTo');

		fromAdress.addEventListener('input', setDefaultInputData);
		toAdress.addEventListener('input', setDefaultInputData)
}

/**
 * Подключение слушателей событий к полям телефона, имени и комментарии
 */
function getInputsData () {
	const telephoneInput = document.getElementById('orderFormTel');
	const nameInput = document.getElementById('orderFormName');
	const comments = document.getElementById('orderFormComment')

	nameInput.addEventListener('input', setDefaultInputData)
	telephoneInput.addEventListener('input', setDefaultInputData)
	comments.addEventListener('input', setDefaultInputData)
}

/**
 * Подключаем функцию обработки нажатий на кнопки формы
 */
function buttonsCounterClick () {
	//получаем кнопки
	const counterButtons = orderForm.querySelectorAll('.counter-btn');
	//следить за кнопками "+" "-" которые обрабатывают (количество людей, машин, времени в часах);
	counterButtons.forEach(button => {button.addEventListener('click', () => {handleCounterButtonClick(button)})});

}
/**
 * Функция добавления  класса ошибки и сообщения
 * @param {*} inputParent - родительский элемент
 * @param {*} errorMessageElement  - элемент для вывода ошибки
 * @param {*} errorMessage  - сообщение об ошибке
 */
function setInvalidInput(field, errorMessage) {
	const inputElement = document.querySelector(`[name="${field}"]`);
	const inputParent = inputElement.closest('.input');
	const errorMessageElement = inputElement.previousElementSibling;

	inputParent.classList.add("input_invalid");
	errorMessageElement.textContent = errorMessage;
}
/**
 * Функция удаления класса ошибки
 * @param {*} inputParent - родительский элемент
 */
function setValidInput(field) {
	const inputElement = document.querySelector(`[name="${field}"]`);
	const inputParent = inputElement.closest('.input');
	inputParent.classList.remove("input_invalid");
}
/**
 * Функция записи данных при клике на кнопках в valuesForm - обьект
 * @param {*} button - элемент кнопки
 */
function handleCounterButtonClick(button) {
	// Находим ближайший родительский элемент с классом input_counter
	const counter = button.closest('.input_counter');

	// Находим input внутри найденного родительского элемента
	const input = counter.querySelector('input');

	// Получаем текущее значение input
	let value = parseInt(input.value);

	// Если нажата кнопка минус, уменьшаем значение на 1, иначе увеличиваем на 1
	if (button.classList.contains('counter-btn_minus')) {
			value = Math.max(0, value - 1);
	} else {
			value += 1;
	}

	// Устанавливаем новое значение в input
	input.value = value;
	valuesForm[input.name] = value; // Добавляем значение в объект valuesForm

	calculateOrderCost()
}
/**
 * Функция создания маски для поля телефон
 * @param {*} phone - номер телефона
 * @returns
 */
function createPhoneMask(phone) {
	const digitsOnly = phone.replace(/\D/g, '');
	// Определяем максимальную длину номера телефона
	const maxLength = 11;
	const formattedPhone = digitsOnly.slice(0, maxLength);
	let maskedPhone = '+' + formattedPhone;

	if (formattedPhone.charAt(0) !== '7') {
		maskedPhone = '+7';
}
	if (formattedPhone.length > 1) {
			maskedPhone = maskedPhone.replace(/^(\+\d{1})(\d)/, '$1 ($2');
	}

	if (formattedPhone.length > 4) {
			maskedPhone = maskedPhone.replace(/^(\+\d{1}\s\()(\d{3})(\d)/, '$1$2) $3');
	}

	if (formattedPhone.length > 7) {
			maskedPhone = maskedPhone.replace(/^(\+\d{1}\s\(\d{3}\)\s)(\d{3})/, '$1$2-');
	}

	if (formattedPhone.length > 9) {
			maskedPhone = maskedPhone.replace(/^(\+\d{1}\s\(\d{3}\)\s\d{3}-)(\d{2})/, '$1$2-');
	}

	if(formattedPhone.length === 10) {
		return maskedPhone;
	}


	return maskedPhone;
}
/**
 * Функция объявления к полю телефона маски
 */
function makePhonMask() {
	const phoneField = document.querySelector('input[type="tel"]');
	phoneField && phoneField.addEventListener('input', (e) => {	e.target.value = createPhoneMask(e.target.value)});
}