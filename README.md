# X-FileSearch

<div align="center">

![Logo](/src/lib/images/logo-w-text.png)


[![GitHub stars](https://img.shields.io/github/stars/mugendi/x-files-search.svg)](https://github.com/mugendi/x-files-search/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/mugendi/x-files-search.svg)](https://github.com/mugendi/x-files-search/issues)
[![GitHub forks](https://img.shields.io/github/forks/mugendi/x-files-search.svg)](https://github.com/mugendi/x-files-search/network)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/mugendi/x-files-search.svg?style=social)](https://twitter.com/intent/tweet?text=Check%20out%20X-FileSearch!%20https://github.com/mugendi/x-files-search)

Full-text, typo-tolerant local file indexer and search engine for developers

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Usage](#usage) • [Contributing](#contributing) • [License](#license)

</div>

## Features

- 🔍 Full-text search across all your local files
- 🐞 Typo-tolerant search for forgiving queries
- 🚀 Fast indexing and searching powered by TypeSense
- 💻 Web-based user interface for easy access
- 🔢 Code syntax highlighting for various languages
- 📁 Support for multiple directory indexing
- 🔒 Local-only indexing for data privacy

## Demo

![Screen Grab 1](/static/screengrabs/scg1.png)

![Screen Grab 2](/static/screengrabs/scg2.png)

## Installation

### Prerequisites

1. [Node.js](https://nodejs.org/) (v14 or later)
2. [Docker](https://www.docker.com/) (for running TypeSense)
3. [hyperpolyglot](https://github.com/monkslc/hyperpolyglot) : (Used to detect programming languages) Install with `cargo install hyperpolyglot`.

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/mugendi/x-files-search.git
   cd x-files-search
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the environment:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and adjust the settings as needed.

4. Set up TypeSense:

   ```bash
   npm run setup
   ```

5. Build the project:
   ```bash
   npm run build
   ```

## Usage

1. Start the server:

   ```bash
   npm run prod
   ```

2. Open your browser and navigate to `http://localhost:9877` (or the port you specified in `.env`).

3. Go to the 'Settings' page to add directories for indexing.

4. Click "Index Files" to start the indexing process.

5. Use the search bar on the home page to find your files!

## Configuration

The `.env` file contains important configuration options:

```env
# App configs
PORT=9877
ORIGIN=http://localhost:9877

# TypeSense configs
API_PORT=9876
API_KEY=myAmazingKey
BULK_DOC_COUNT=50
MAX_FILE_SIZE="1MB"
IGNORE_PATTERNS=**/node_modules/**,**/env/**,**/.env/**,**/venv**,**/.venv/**,**/yarn.*,**/npm.*,**/python*/site-packages/**
```

Adjust these settings to fit your needs and environment.

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [TypeSense](https://typesense.org/) for providing the powerful search engine
- [hyperpolyglot](https://github.com/monkslc/hyperpolyglot) for language detection

## Support

If you find this project useful, please consider giving it a ⭐️ on GitHub!

---

<div align="center">
Made with ❤️ by <a href="https://github.com/mugendi">Anthony Mugendi</a>
</div>
