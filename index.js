var GitHub = require('github-api');
const http = require('http')

http.createServer((req, res) => {

	let auth = req.headers.authorization;
	var username, password;
	console.log("auth ", auth );
	if(auth){
		var tmp = auth.split(' ');
        var buf = new Buffer(tmp[1], 'base64');
        var plain_auth = buf.toString();
        var creds = plain_auth.split(':');
        username = creds[0];
        password = creds[1];
	}
	
	let body = ''
		req.on('data', chunk => { body += chunk.toString() })
		req.on('end', () => {
			
			if (!['/create-repo', '/delete-repo', '/create-branch', '/get-repo', '/branch-list','/commit'].includes(req.url)) {
				res.writeHead(404)
				res.end()
			}
			let content = JSON.parse(body);
			
			var gh = gitValidate(username,password);
			var repo = gh.getRepo(username, content.reponame);
			
			if (['/create-repo'].includes(req.url)) {
				createRepo(gh, content.reponame, username, content.options, res);
			}
			
			if (['/get-repo'].includes(req.url)) {
				getRepo(repo,res);
			}
			
			if (['/delete-repo'].includes(req.url)) {
				deleteRepo(repo,res);
			}
			
			if (['/create-branch'].includes(req.url)) {
				createBranch(repo, content.branchname,res);
			}
			if (['/branch-list'].includes(req.url)) {
				getBranchList(repo,res);
			}

		})
}).listen(process.env.PUBSUB_PORT || 5000)

function gitValidate(username, password) {
	return new GitHub({
		username: username,
		password: password
	});
}

function createRepo(gh, repo,username,options,res){
	var user = gh.getUser(username);
	var repoDetail = {};
	user.createRepo(options, function(err, repodata) {
		repoDetail.name = repodata.name;
		repoDetail.full_name = repodata.full_name;
		repoDetail.owner = repodata.owner.login;
		repoDetail.url = repodata.git_url;
		
		try {
			res.writeHead(200, {'Content-Type': 'application/json' })
			res.end(res.end(JSON.stringify(repoDetail)))
		} catch (ignored) {
			res.writeHead(400)
			res.end()
		}
	});
	
}

function getRepo(repo,res) {
	var repoDetail = {};
	repo.getDetails(function(err, repodata) {
		repoDetail.name = repodata.name;
		repoDetail.url = repodata.git_url;
		repoDetail.default_branch = repodata.default_branch;
		repoDetail.clone_url = repodata.clone_url;
		repoDetail.owner = repodata.owner.login;
		try {
			res.writeHead(200, {'Content-Type': 'application/json' })
			res.end(res.end(JSON.stringify(repoDetail)))
		} catch (ignored) {
			res.writeHead(400)
			res.end()
		}
	});
}

function deleteRepo(repo,res) {
	repo.deleteRepo(function(err, result, request) {
		try {
			res.writeHead(200, {'Content-Type': 'application/json' })
			res.end(res.end(JSON.stringify(result)))
		} catch (ignored) {
			res.writeHead(400)
			res.end()
		}
	});
}

function createBranch(repo,branchname,res ) {
	repo.createBranch(branchname, function(err, result, request) {
		try {
			res.writeHead(200, {'Content-Type': 'application/json' })
			res.end(res.end(JSON.stringify(result)))
		} catch (ignored) {
			res.writeHead(400) 
			res.end()
		}
	});
}

function getBranchList(repo,res) {
	repo.listBranches(function(err, result, request) {
		try {
			res.writeHead(200, {'Content-Type': 'application/json' })
			res.end(res.end(JSON.stringify(result)))
		} catch (ignored) {
			res.writeHead(400) 
			res.end()
		}
	});
}

