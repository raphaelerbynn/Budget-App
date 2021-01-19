
//BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function (totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        totalExpPercentage: -1,
        //eachPercentage: -1

    
    }

    
    var calcTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });

        data.total[type] = sum;
    }


    return {
        addItem: function (type, des, val) {
            //variables
            var newItem, ID;

            //create new id for each item
            //id = lastElementIndex + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }


            //checking where to place with type 'inc' or 'esp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
                //data.eachPercentage = (newItem.value / data.budget)*100;
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //adding item to array
            data.allItems[type].push(newItem);

            localStorage.setItem('items', JSON.stringify(data.allItems));

            return newItem;

        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (currentVal) {
                return currentVal.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },


        calculateBudject: function () {
            //total exp and inc
            calcTotal('inc');
            calcTotal('exp');

            //budject
            data.budget = data.total.inc - data.total.exp;

            //percentage
            if (data.total['inc'] > 0) {
                data.totalExpPercentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.totalExpPercentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.total.inc);
            });
        },

        getCalcPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });

            return allPercentages;
        },

        getBudgetData: function () {
            return {
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                budget: data.budget,
                //eachPercent: data.eachPercentage,
                totalPercent: data.totalExpPercentage
            }
        },


        testing: function () {
            return data;
        }
    }


})();


//UI CONTROLLER
var UIController = (function () {


    var DOMStrings = {
        dateLabel: '.budget__title--month',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',

        inputDescription: '.add__description',
        inputType: '.add__type',
        inputValue: '.add__value',
        inputBtn: '.add__btn',

        container: '.container',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',

        eachPercentage: '.item__percentage',
        allPercentage: '.budget__expenses--percentage',

        imgID: 'btn_img'

    };

    var formatNumber = function(number){
        var intSplit, int, deci;

        intSplit = number.split('.');

        int = intSplit[0];
        deci = intSplit[1];

        if (int.length > 3){
            
            int = int.substr(0, int.length-3)  + ',' + int.substr(int.length-3, int.length);
        }

        return int + '.' + deci;
    };

    var nodeListForEach = function (list, callBack) {
        for (var i = 0; i < list.length; i++) {
            callBack(list[i], i);
        }
    };

    return {

        displayDate: function(){
            var date, month, year, months, day, dayNum, dayFormat;

            date = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            year = date.getFullYear();
            month = date.getMonth();
            dayNum = date.getDate();

            day = parseInt(dayNum.toString().charAt(dayNum.toString().length - 1));

            if (day === 1){
                dayFormat = dayNum + 'st';
            }else if (day === 2){
                dayFormat = dayNum + 'nd';
            }else if (day === 3){
                dayFormat = dayNum + 'rd';
            }else if (day === 0 || day > 3){
                dayFormat = dayNum + 'th'
            }

            document.querySelector(DOMStrings.dateLabel).textContent = dayFormat + ' ' + months[month] + ', ' + year;
        },

        getInput: function () {
            return {
                description: document.querySelector(DOMStrings.inputDescription).value,
                type: document.querySelector(DOMStrings.inputType).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        updateItemList: function (type, itemObj) {

            var html, newHtml, element;

            //create html string with placeholder
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">GHc %value%</div><div class="item__delete"><button class="item__delete--btn"><img src="inc_delete.png" width="20px"></button></div></div></div>'

            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">GHc %value%</div><div class="item__percentage">0%</div><div class="item__delete"><button class="item__delete--btn"><img src="exp_delete.png" width="20px"></button></div></div></div>'

            }

            //create html string with placeholder
            newHtml = html.replace('%id%', itemObj.id);
            newHtml = newHtml.replace('%description%', itemObj.description);
            newHtml = newHtml.replace('%value%', formatNumber((itemObj.value).toFixed(2)));


            //insert html into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        },

        displayItemPercentage: function (percentArr) {
            var fields;

            fields = document.querySelectorAll(DOMStrings.eachPercentage);

            nodeListForEach(fields, function (current, index) {
                if (percentArr[index] > 0) {
                    current.textContent = percentArr[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        removeListItem: function (itemID) {

            var element = document.getElementById(itemID);
            element.parentNode.removeChild(element);

        },

        changeInputType: function () {
            var inputsHolder = document.querySelectorAll(DOMStrings.inputType + ', ' +
                DOMStrings.inputDescription + ', ' +
                DOMStrings.inputValue);

            nodeListForEach(inputsHolder, function(cur){
                cur.classList.toggle('red-focus');
            });

            
            // document.getElementById(DOMStrings.imgID).src = 'exp_delete.png';
            console.log((document.getElementById(DOMStrings.imgID).src).match('add_btn') == 'add_btn');

            if ((document.getElementById(DOMStrings.imgID).src).match('add_btn') == 'add_btn'){
                document.getElementById(DOMStrings.imgID).src = 'btn_chng.png';
            }
            else {
                document.getElementById(DOMStrings.imgID).src = 'add_btn.png';
            }
                
        
        },

        clearField: function () {

            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();



        },

        getDOMStrings: function () {
            return DOMStrings;
        },

        displayBudgets: function (obj) {
            document.querySelector(DOMStrings.incomeLabel).textContent = '+Ghc ' + (obj.totalInc).toFixed(2);
            document.querySelector(DOMStrings.expensesLabel).textContent = '-Ghc ' + (obj.totalExp).toFixed(2);
            if (obj.totalPercent > 0) {
                document.querySelector(DOMStrings.allPercentage).textContent = obj.totalPercent + '%';
            } else {
                document.querySelector(DOMStrings.allPercentage).textContent = '---';
            }

            if (obj.totalInc < obj.totalExp) {
                document.querySelector(DOMStrings.budgetLabel).textContent = (obj.budget).toFixed(2) + ' GHc';
            } else {
                document.querySelector(DOMStrings.budgetLabel).textContent = '+Ghc ' + (obj.budget).toFixed(2);
            }
        }

    }

})();


//APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMStrings()
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                console.log('Enter was pressed...');
                ctrlAddItem();
            }


        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeInputType);

        //UICtrl.changeInputType();

    }

    var updateBudget = function () {
        //calculate the budget
        budgetCtrl.calculateBudject();

        //get budget values
        var budgetData = budgetCtrl.getBudgetData();

        //document.querySelector(DOM.eachPercentage).value = budgetData.eachPercent;

        //display the buget in UI
        console.log(budgetData);
        UICtrl.displayBudgets(budgetData);
    }

    var updatePercentages = function () {
        //calc perccentage
        budgetCtrl.calculatePercentages();

        //get percentage
        var percentages = budgetCtrl.getCalcPercentages();

        //update on UI
        UICtrl.displayItemPercentage(percentages);
    }



    var ctrlAddItem = function () {
        var inputObject, newItem;

        //get input data
        inputObject = UICtrl.getInput();

        if (inputObject.description !== "" && !isNaN(inputObject.value) && inputObject.value > 0) {

            //add item to the budget controller
            newItem = budgetCtrl.addItem(inputObject.type, inputObject.description, inputObject.value);

            //add item to UI
            UICtrl.updateItemList(inputObject.type, newItem);


            //clear fields
            UICtrl.clearField();

            //update budget
            updateBudget();

            //percentages
            updatePercentages();

            //save to local storage
            

        }



    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //delete from data structure
            budgetCtrl.deleteItem(type, ID);

            //delete from UI
            UICtrl.removeListItem(itemID);

            //update budget
            updateBudget();

            //update percentages
            updatePercentages();


        }


    }





    return {
        init: function () {
            UICtrl.displayDate();
            UICtrl.displayBudgets({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                totalPercent: -1
            });

            setupEventListeners();
        }
            
    }



})(budgetController, UIController);


controller.init();