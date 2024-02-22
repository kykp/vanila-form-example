const errorMessages = {
  requiredField: 'Данное поле обязательно для заполнения',
  minPhone: 'Телефон должен содержать 11 цифр'
}

const servicesPrice = {
  people: 350,
  machines: 500,
  hours: 350,
}

document.addEventListener('DOMContentLoaded', () => {
  initForm();
})


function initForm() {
  const formValues = {
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
  }

  const formErrors = {};

  const form = document.getElementById('orderForm');
  const submitButton = document.getElementById('orderFormButton');
  const inputs = form.querySelectorAll('input');
  const inputCounters = document.querySelectorAll('.input_counter');

  // инициализация инпутов без счетчиков
  initInputsWithOutButtons(formValues, inputs, formErrors, form);
  // инициализация инпутов счетчиков
  initInputsWithButtons(formValues, inputCounters);


  submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    inputValidation(formValues, formErrors, form);

    if(Object.keys(formErrors).length >= 1) {
      return console.log('Форма не отправлена есть не заполненые обязательные поля')
    }

    console.log('Форма отправлена', formValues)
  })
}

function initInputsWithButtons(formValues, inputCounters) {
  inputCounters.forEach(container => {
    const minusButton = container.querySelector('.counter-btn_minus');
    const plusButton = container.querySelector('.counter-btn_plus');
    const inputField = container.querySelector('input[type="number"]');
    const inputName = inputField.name;

    minusButton.addEventListener('click', () => {
      let value = parseInt(inputField.value);
      if (value > 0) {
        value -= 1;
        inputField.value = value;
      }

      formValues[inputName] = value;
      calculateOrderCost(formValues)
    });

    plusButton.addEventListener('click', () => {
      let value = parseInt(inputField.value);
      value += 1;
      inputField.value = value;
      formValues[inputName] = value;
      calculateOrderCost(formValues)
    });
  });
}

function initInputsWithOutButtons(formValues, inputs, formErrors, form) {
  const requiredFields = ['date', 'time', 'addressFrom', 'addressTo', 'name', 'tel'];

  inputs.forEach(input => {
    // Проверяем, что текущий инпут имеет кнопоки внутри и прощаемся с ним
    if (input.closest('.input_counter')) {
      return;
    }
    input.addEventListener('input', (e) => {
      const inputType = e.currentTarget.type;
      const name = e.currentTarget.name;
      if (inputType === 'tel') {
        handleTelInput(e.currentTarget, formValues)
      }
      formValues[name] = e.currentTarget.value;

      if(requiredFields.includes(name)) {
        inputValidation(formValues, formErrors, form)
      }
    })
  });
}

function handleTelInput(input, formValues) {
  const name = input.name;
  const phoneMaskedValue = createPhoneMask(input.value);
  input.value = phoneMaskedValue;
  formValues[name] = phoneMaskedValue;
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

  if (formattedPhone.length === 10) {
    return maskedPhone;
  }


  return maskedPhone;
}

/**
 * функция валидации с установкой ui валидации
 */
function inputValidation (formValues, formErrors, form) {
  const requiredFields = ['date', 'time', 'addressFrom', 'addressTo', 'name', 'tel'];

  requiredFields.forEach(field => {
    if (!formValues[field]) {
      formErrors[field] = errorMessages.requiredField;
      setError(form, field, errorMessages.requiredField, 'input_invalid');
    } else if (field === 'tel' && formValues[field].length < 18) {
      formErrors[field] = errorMessages.minPhone;
      setError(form, field, errorMessages.minPhone, 'input_invalid');
    } else if (field in formErrors){
      delete formErrors[field];
      clearError(form, field, 'input_invalid');
    }
  })
}

/**
 *
 * @param form - форма например (const form = document.getElementById('orderForm'))
 * @param field - имя поля с ошибкой (string)
 * @param errorMessage - сообщение об ошибке (string)
 * @param errorClass - класс который присваевается обертке инпута (string)
 */
function setError(form, field, errorMessage, errorClass) {
  const formField = form.querySelector(`[name="${field}"]`);
  const inputParent = formField.closest('.input');
  const messageField = formField.previousElementSibling;
  messageField.textContent = errorMessage;
  inputParent.classList.add(errorClass);
}

/**
 *
 * @param form - форма например (const form = document.getElementById('orderForm'))
 * @param field - имя поля с ошибкой (string)
 * @param errorClass -  класс который присваевается обертке инпута (string)
 */
function clearError(form, field, errorClass) {
  const formField = form.querySelector(`[name="${field}"]`);
  const inputParent = formField.closest('.input');
  inputParent.classList.remove(errorClass);
}

function calculateOrderCost (formValues) {
  let totalPrice = 0;

  // Проверяем, есть ли какие-либо услуги в заказе
  const anyServiceSelected = formValues.hours !== 0 || formValues.people !== 0 || formValues.machines !== 0;
  // Если нет выбранных услуг, общая стоимость равна 0
  if (!anyServiceSelected) {
    totalPrice = 0;
  } else {
    const totalCars = formValues.machines * servicesPrice.machines;
    const totalPeople = formValues.people * servicesPrice.people;
    totalPrice += (totalCars + totalPeople) * formValues.hours;
  }
  setTotalAmount(totalPrice)
}

/**
 * Установка значения в поле с ценой
 */
function setTotalAmount (totalPrice) {
  const sumField = document.querySelector('#orderFormTotal');
  sumField.textContent = totalPrice;
}