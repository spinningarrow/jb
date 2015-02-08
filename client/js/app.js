require('normalize-css');
var React = require('react');
var qwest = require('qwest');
var marked = require('marked');
var yaml = require('js-yaml');
var moment = require('moment');

// var url = 'https://api.github.com/repos/spinningarrow/spinningarrow.github.io/contents/_posts';
var url = 'temp-posts.json';

var parsePost = function (postContent) {
	var frontMatterEndIndex = postContent.lastIndexOf('---') + 3;

	return {
		meta: yaml.safeLoad(postContent.substring(3, frontMatterEndIndex - 3)),
		body: marked(postContent.substring(frontMatterEndIndex))
	};
}

var PostBox = React.createClass({
	getInitialState: function () {
		// return { data: [] };
		var samplePost = {
			'name': 'something',
			'content': btoa('---\ntitle: SamplePost\ndate: ' + new Date().toISOString() + '\n---')
		};

		return { data: Array.apply(null, Array(20)).map(function () { return samplePost; }), loading: true };
	},

	componentDidMount: function () {
		qwest.get(url)
			.then(JSON.parse)
			.then(function (posts) {
				var fullPostPromises = posts.map(function (post) {
					// return qwest.get(post.url);
					return qwest.get('temp-post-hny.json').then(JSON.parse);
				});

				Promise.all(fullPostPromises)
					.then(function (fullPosts) {
						this.setState({ data: fullPosts.reverse(), loading: false });
					}.bind(this));
			}.bind(this));
	},

	render: function () {
		return (
			<div className={this.state.loading ? 'post-box is-loading' : 'post-box'}>
				<PostList posts={this.state.data}/>
			</div>
		);
	}
});

var PostList = React.createClass({
	render: function () {
		var nodes = this.props.posts.map(function (post) {
			return (
				<li><Post title={post.name} content={post.content} /></li>
			);
		});

		return (
			<ul className="post-list">{nodes}</ul>
		);
	}
});

var Post = React.createClass({
	getPostMeta: function () {
		return parsePost(decodeURIComponent(escape(atob(this.props.content)))).meta;
	},

	render: function () {
		return (
			<div className="post">
				<h2>{this.getPostMeta().title}</h2>
				<time>{this.getPostMeta().date && moment(this.getPostMeta().date).fromNow()}</time>
			</div>
		);
	}
});

React.render(<PostBox/>, document.querySelector('main'));
