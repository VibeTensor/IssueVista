<!--
  SVG Filters for hand-drawn sketch effects
  Issue #35 - Extracted from ResultsList.svelte

  Usage: Import and place once at the top of any page/component that needs sketch effects.
  The filters can be referenced via CSS: filter: url(#sketch) or filter: url(#sketch-light)
-->

<svg width="0" height="0" style="position: absolute; pointer-events: none;" aria-hidden="true">
  <defs>
    <!-- Strong sketch filter for borders -->
    <filter id="sketch" x="-50%" y="-50%" width="200%" height="200%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.05"
        numOctaves="4"
        result="noise"
        seed="3"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="2.5"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>

    <!-- Light sketch filter for subtle effects -->
    <filter id="sketch-light" x="-50%" y="-50%" width="200%" height="200%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.03"
        numOctaves="2"
        result="noise"
        seed="5"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="1"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </defs>
</svg>
