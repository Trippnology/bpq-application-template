import * as _ from 'lodash-es';
import net from 'node:net';
import readline from 'node:readline';

// Keep any other config options for your app here too
const config = {
	// The local port your app will listen on. Add this under CMDPORT in BPQ32.cfg
	port: 63002,
};

const server = new net.Server();
server.listen(config.port, () => {
	console.log(`Listening on port ${config.port}`);
});

// Keep track of active connections
let connections = [];
// List of valid commands this app supports (used by the help command)
const command_list = ['exit', 'name', 'yo'];

function exit(connection) {
	connection.rl.close();
	connection.socket.end();
	connections = _.without(connections, connection);
	console.log(`${connection.user.callsign} disconnected`);
}

function parseLine(connection, input) {
	switch (input.toLowerCase()) {
		case '?':
			connection.socket.write(
				`Available commands: ${command_list.join(', ')}\n`,
			);
			break;
		case 'exit':
			return exit(connection);
		case 'name':
			connection.rl.question('Please enter your name: ', (name) => {
				connection.user.name = name;
				socket.write(
					`Nice to meet you, ${connection.user.name} ${connection.user.callsign}.\n`,
				);
			});
			break;
		case 'yo':
			connection.socket.write(`Yo ${connection.user.callsign}!\n`);
			break;
		default:
			// If the user input was not a valid command, just echo back what they typed
			connection.socket.write(`You said: ${input}\n`);
	}
}

server.on('connection', (socket) => {
	const connection = {
		socket,
		rl: readline.createInterface({ input: socket, output: socket }),
		user: {
			callsign: '',
			name: '',
		},
	};

	// The callsign is passed in when BPQ connects
	connection.rl.question('', (callsign) => {
		connection.user.callsign = callsign;
		console.log(`${callsign} connected`);
		// Add this to our list of active connections
		connections.push(connection);

		// You can now start responding however you like
		connection.socket.write(
			`Hello, ${callsign}!\nYou can type "exit" to exit this application.\n`,
		);
		connection.socket.write('Type ? for a list of available commands.\n');

		connection.rl.on('line', (input) => {
			parseLine(connection, input);
		});
	});
});
