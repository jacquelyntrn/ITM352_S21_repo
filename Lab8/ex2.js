require("./products_data.js");

num_products = 5; 

for(var item_num = 1; eval("typeof name"+item_num) != 'undefined'; ++item_num){
    // This goes up as for item # and evaluates it so that it reads the product
    console.log(`${item_num}.${eval('name' + item_num)}`); 
}
console.log(`That's all we have!`);
