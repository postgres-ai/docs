/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? `${language}/` : '') + doc;
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('postgres-ai-platform-overview')}>
              Platform overview
            </a>
            <a href={this.docUrl('get-started')}>
              Getting Started
            </a>
            <a href={this.docUrl('questions-and-answers')}>
              Q&A
            </a>
            <a href={this.docUrl('guides/index')}>
              Guides
            </a>
          </div>
          <div>
            <h5>Reference</h5>
            <a href={this.docUrl('database-lab/5_api_reference')}>
              API reference
            </a>
            <a href={this.docUrl('database-lab/6_cli_reference')}>
              CLI reference
            </a>
          </div>
          <div>
            <h5>Links</h5>
            <a href="https://postgres.ai/">Home</a>
            <a
              href="https://gitlab.com/postgres-ai"
              target="_blank"
              rel="noopener">
              GitLab
            </a>
            <a
              href="https://twitter.com/Database_Lab"
              target="_blank"
              rel="noopener">
              Twitter
            </a>
            <a
              href="https://www.youtube.com/channel/UCLSWQVJX_VQ0NVSzN0fZT3A"
              target="_blank"
              rel="noopener">
              YouTube
            </a>
          </div>
          <div>
            <h5>Support</h5>
            <a href="https://database-lab-team-slack-invite.herokuapp.com/">Community Slack</a>
          </div>
        </section>

        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    );
  }
}

module.exports = Footer;
