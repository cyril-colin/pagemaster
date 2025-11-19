# PageMaster Workspace

PageMaster is a tool for improvised tabletop role-playing games. Connected players can see in real-time their HP,
inventories, statuses (and much more!) updated by the dungeon master.

## Give it a try

You can test this application by running the [docker image (with a mongodb)](https://hub.docker.com/r/cyrilbr/pagemaster)


## Getting Started (Dev)

```bash
git clone git@github.com:cyril-colin/pagemaster.git
cd pagemaster
npm i --prefix ./back
npm i --prefix ./front
code pagemaster.code-workspace

# run both commands in dedicated terminal
cd ./back && npm start
cd ./front && npm start 
```



## Architecture point

### State management

The state management rely on socket event : when an event is triggered, the new whole game session representation is sent via socket to the front that re-render on modified items thanks to angular zoneless and signals.


### Design Pattern Command

Each event is sent via a `POST /game-events/command`. Then the backend use a Command Pattern to deal with different event types and keep them into an history.


### Why Monorepo?

This project uses a monorepo structure for several practical reasons:

- **Solo Development Simplicity**: As a solo developer, maintaining a single repository makes it much easier to update and synchronize changes across the codebase.
- **No Need for Separate Artifacts**: There are no plans for separate artifact management or versioning between the frontend and backend, which eliminates the need for separate CI/CD pipelines.
- **Flexible Architecture**: Thanks to VS Code workspace configuration, the project maintains a logical separation between frontend and backend, making it easier to split them into separate repositories in the future if needed.