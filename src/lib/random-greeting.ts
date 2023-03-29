const greetings = [
    'Hello World!',
    'Hi there!',
    'Greetings!',
    'Howdy!'
]

export const randomGreeting = (random: number) => {
    return greetings[Math.floor(random * greetings.length)]
}