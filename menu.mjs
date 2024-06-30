import * as _ from 'lodash-es';
import net from 'node:net';
import readline from 'node:readline';
import { menu } from 'bpq-menu-system';

const config = {
	port: 63002,
};

const server = new net.Server();
server.listen(config.port, () => {
	console.log(`Listening on port ${config.port}`);
});

let connections = [];

function exit(connection) {
	connection.rl.close();
	connection.socket.end();
	connections = _.without(connections, connection);
	console.log(`${connection.callsign} disconnected`);
}

server.on('connection', (socket) => {
	const connection = {
		socket,
		rl: readline.createInterface({ input: socket, output: socket }),
	};

	// The callsign is passed in when BPQ connects
	connection.rl.question('', (callsign) => {
		connection.callsign = callsign;
		console.log(`${connection.callsign} connected`);

		connections.push(connection);

		const menu_1 = {
			label: 'Choose an option:',
			choices: [
				{ label: 'Option One', value: 'one' },
				{ label: 'Option Two', value: 'two' },
				{ label: 'Option Three', value: 'three' },
				{ label: 'Quit', value: 'exit' },
			],
		};

		return menu(connection, menu_1)
			.then((choice) => {
				switch (choice) {
					case 'one':
					case 'two':
					case 'three':
						// You would normally do something based on the choice here
						connection.socket.write(`You chose: ${choice}\n`);
						// You would normally only exit if the user chose the exit option
						return exit(connection);
					case 'exit':
						connection.socket.write('OK, bye for now!\n');
						return exit(connection);
				}
			})
			.catch((error) => {
				connection.socket.write(`${error}\n`);
				return exit(connection);
			});
	});
});
