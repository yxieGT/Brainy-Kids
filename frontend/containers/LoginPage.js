import React, { Component } from 'react';

import { Row, Col, Card, Input, Icon, Button, notification } from 'antd';

import { Link, withRouter } from 'react-router-dom';

import { connect } from 'react-redux';
import actions from '../actions';
import { bindActionCreators } from 'redux';

class LoginPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			buttonDisabled: true,
			loading: false,
			email: '',
			password: '',
		};
		this.onSubmit = this.onSubmit.bind(this);
	}

	componentWillMount() {
		const { teacher, token } = this.props;

		// If this user is already logged in with good credentials, they may
		// have manually navigated to this page.
		if (teacher && token) {
			this.props.history.replace('/dashboard');
		}
	}

	onEmailChange(e) {
		let buttonDisabled = true;
		if (e.target.value.length > 0 && this.state.password.length > 0) {
			buttonDisabled = false;
		}

		this.setState({ email: e.target.value, buttonDisabled });
	}

	onPasswordChange(e) {
		let buttonDisabled = true;
		if (e.target.value.length > 0 && this.state.email.length > 0) {
			buttonDisabled = false;
		}

		this.setState({ password: e.target.value, buttonDisabled });
	}

	invalidUsernamePasswordAlert() {
		notification['error']({
			message: 'Invalid email / password',
			description:
				'The email and password combination you have entered is not correct.',
		});
	}

	onSubmit() {
		console.log(this.props);
		const { email, password } = this.state;
		const { login } = this.props;
		if (email.length === 0 || password.length === 0) {
			this.setState({ loading: false, buttonDisabled: true });
			return;
		}

		this.setState({ loading: true });
		fetch(`/api/session/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email,
				password,
			}),
		})
			.then(res => res.json())
			.then(json => {
				if (json.status !== 'ok') {
					this.setState({ loading: false, password: '' });
					this.invalidUsernamePasswordAlert();
				} else {
					login(json.token, json.teacher);
					setTimeout(() => {
						this.props.history.replace('/dashboard');
					}, 200);
				}
			})
			.catch(err => {
				console.error(err);
				this.setState({ loading: false });
				this.invalidUsernamePasswordAlert();
			});
	}

	render() {
		const { email, password, loading, buttonDisabled } = this.state;

		return (
			<Row type="flex" justify="center" style={{ marginTop: 100 }}>
				<Col xs={24} sm={24} md={12} lg={8}>
					<Card title="Login to Portal">
						<div style={{ textAlign: 'right' }}>
							<Input
								placeholder="Email"
								prefix={
									<Icon
										type="user"
										style={{ color: 'rgba(0,0,0,.25)' }}
									/>
								}
								disabled={loading}
								value={email}
								type="email"
								style={{ marginTop: 20 }}
								onChange={this.onEmailChange.bind(this)}
							/>
							<Input
								placeholder="•••••••"
								prefix={
									<Icon
										type="key"
										style={{ color: 'rgba(0,0,0,.25)' }}
									/>
								}
								disabled={loading}
								value={password}
								type="password"
								style={{ marginTop: 20 }}
								onChange={this.onPasswordChange.bind(this)}
							/>
							<Button
								style={{
									textAlign: 'center',
									marginTop: 20,
								}}
								loading={loading}
								disabled={loading || buttonDisabled}
								onClick={this.onSubmit}
								type="primary">
								Login
							</Button>
						</div>
					</Card>
				</Col>
			</Row>
		);
	}
}

const mapStateToProps = state => {
	return {
		token: state.teacher.token,
		teacher: state.teacher.data,
	};
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators({ ...actions.teacher }, dispatch);
};

export default withRouter(
	connect(
		mapStateToProps,
		mapDispatchToProps
	)(LoginPage)
);
