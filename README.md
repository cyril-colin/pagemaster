# PageMaster Workspace

PageMaster is a tool for improvised tabletop role-playing games. Connected players can see in real-time their HP,
inventories, statuses (and much more!) updated by the dungeon master.

## Getting Started

```bash
git clone git@github.com:cyril-colin/pagemaster.git
cd pagemaster
npm i --prefix ./back
npm i --prefix ./front
code pagemaster.code-workspace
```

## Why Monorepo?

This project uses a monorepo structure for several practical reasons:

- **Solo Development Simplicity**: As a solo developer, maintaining a single repository makes it much easier to update and synchronize changes across the codebase.
- **No Need for Separate Artifacts**: There are no plans for separate artifact management or versioning between the frontend and backend, which eliminates the need for separate CI/CD pipelines.
- **Flexible Architecture**: Thanks to VS Code workspace configuration, the project maintains a logical separation between frontend and backend, making it easier to split them into separate repositories in the future if needed.
