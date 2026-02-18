import re


def clean_quill_html(html: str) -> str:
    """
    Cleans up HTML from the Quill editor before saving it to the database.
    Removes &nbsp;, inline styles, and soft hyphens that
    Quill inserts when copying text from the clipboard.
    """
    if not html:
        return html
    html = html.replace('&nbsp;', ' ')
    html = html.replace('\u00a0', ' ')
    html = re.sub(r'\s*style="[^"]*"', '', html)
    html = html.replace('\u00ad', '').replace('&shy;', '')
    return html