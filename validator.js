// contructor function
function validator(options) {
    function getParent(element,selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element=element.parentElement;
        }
    }

    var selectorRules ={};
    // hàm thực hiện validate
    function validate(inputElement,rule){   
        var errorMessage ;
        var errorElement= getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
        // lấy ra các rule của selectpr
        var rules = selectorRules[rule.selector];
        // lặp qua từng rule và kiểm tra
        // nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; i++) {
            switch(inputElement.type){
                case 'radio':
                    errorMessage=rules[i](
                        formElement.querySelector(rule.selector+':checked'),
                    )
                    break;
                case 'checkbox':

                    break    
                default:
                    errorMessage = rules[i](inputElement.value);       
            }

            if (errorMessage) break;
        }
        
        if(errorMessage){
            errorElement.innerText= errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid');
        } else{
            errorElement.innerText='';
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
        }
        return !errorMessage

    }
    // lấy element của form cần validate 
    var formElement = document.querySelector(options.form);
    if(formElement){
        // khi submit form
        formElement.onsubmit = function(e){
            e.preventDefault();
            isFromVlaid = true;
            // lặp qua từng rule và validate
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                var isVlaid =validate(inputElement,rule);
                if (!isVlaid){
                    isFromVlaid= false;
                }
            });

            if(isFromVlaid){
                // trường hợp submit với javascript
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce((values, input) => {

                        switch (input.type) {
                            case 'radio':
                                    values[input.name] = formElement.querySelector('input[name="'+input.name+'"]:checked').value;
                                    break;
                            case 'checkbox':
                                if (!!input.matches(':checked')) {
                                    values[input.name] = [];
                                }
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;    
                                break;
                            default:
                                (values[input.name] = input.value);
                        } 
                            return values;  

                    },{});
                    options.onSubmit(formValues);
                }
                // trường hợp submit với hành vi mặc định
                else{
                    formElement.submit();
                }

            }
        }

        //lặp qua các rules rồi xử lý( lắng nghe blur, input)
        options.rules.forEach(rule => {

            // lưu lại các rules cho mỗi input
           if (Array.isArray(selectorRules[rule.selector])) {
            selectorRules[rule.selector].push(rule.test);
           } else{
            selectorRules[rule.selector] = [rule.test];
           } 
            //selectorRules[rule.selector]= rule.test;

            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(inputElement => {
                
                    // xử lý trường hợp blur khỏi input
                    inputElement.onblur = function(){
                        validate(inputElement,rule)
                    }
                    // xử lý mỗi khi trường hợp người dùng nhập vào input
                    inputElement.oninput = function(){
                        var errorElement= getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
                        errorElement.innerText='';
                        getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
                    }
                
            })

        });
    } 

};
//Định nghĩa rules
// Nguyên tắc của các rules
//1. Khi có lỗi => trả ra message lỗi
//2. khi hợp lệ => không trả ra cái gì cả (undefined)
validator.isRequired = function(selector,message){
    return {
        selector: selector,
        test: function(value){
            return value ? undefined : message ||'Vui lòng nhập trường này';
        }
    }
};

validator.isEmail = function(selector){
    return {
        selector: selector,
        test: function(value){
            var regax = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regax.test(value) ? undefined : 'Trường này phải là email';
        }
    }
};
validator.minLength = function(selector, min) {
    return {
        selector: selector,
        test: function(value){
            return value.length >=min ? undefined : `Vui lòng nhật đủ ${min} ký tự`;
        }
    }    
}
validator.isConfirmed = function(selector,getConfirmValue,message){
    return {
        selector: selector,
        test: function(value){
           return value === getConfirmValue() ? undefined :message ||'Giá trị nhập vào không chính xác'; 
        }
    }
}    