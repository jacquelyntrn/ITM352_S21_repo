//object template var product = {brand:"", price:, image:};
//array template for all products var products = [product1, product2, ...];
//product info
products = [
        product1 = {
            name: "Softserve",
            price: 8.00,
            image: "./images/softserve.jpg",
            disc: "Machine churned. Softer than the typical ice cream texture."
        },
    
        product2 = {
            name: "Mochi Ice Cream",
            price: 18.00,
            image: "./images/mochi.jpg",
            disc: "Your classic matcha ice cream delicately wrapped in soft, chewy mochi."
        },
    
        product3 = {
            name: "Pocky",
            price: 11.00,
            image: "./images/pocky-matcha.jpg",
            disc: "The crunchy cracker stick snack dipped in delictable matcha flavor."
        },
    
        product4 = {
            name: "Cake",
            price: 20.00,
            image: "./images/cake.jpg",
            disc: "A lightly flavored cake that isn't too sweet. A birthday favorite."
        },
    
        product5 = {
            name: "Kit Kat",
            price: 3.50,
            image: "./images/kitkat.jpg",
            disc: "An exclusive flavor of Japan. A unique variation of the popular candy bar."
        },
    ]

    if(typeof module != 'undefined') {
        module.exports = products;
    } 