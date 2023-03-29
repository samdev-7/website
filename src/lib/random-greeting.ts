export const greetings = [
    'print("Hello, world!")',
    'console.log("Hello, world!");',
    'printf("Hello World");',
    'std::cout ＜＜ "Hello, world!";',
    'System.out.println("Hello, world!");',
    'print "Hello, world!"',
    'puts "Hello, world!"',
    'echo "Hello, world!";',
    'System.Console.WriteLine("Hello, world!");'
]

export const randomGreeting = (random: number) => {
    return greetings[Math.floor(random * greetings.length)]
}