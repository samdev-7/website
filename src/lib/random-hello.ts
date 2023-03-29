const greetings = [
    'Hello World!',
    'Hi there!',
    'Greetings!',
    'Howdy!',
    'print("Hello World!")',
    'console.log("Hello World!");',
    'System.out.println("Hello World!");',
    'std::cout << "Hello World!";',
]

export const randomGreeting = () => {
    return greetings[Math.floor(Math.random() * greetings.length)]
}